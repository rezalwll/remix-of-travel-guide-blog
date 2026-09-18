import { transitionBooking, type BookingState } from "../domain/booking.js";
import type { ProviderRegistry } from "../providers/registry.js";
import type { SupplierItem, TravelSupplier } from "../providers/travel.js";
import { ProviderError } from "../providers/types.js";
import { ProviderExecutor } from "../providers/execute.js";

export type SupplierKind = "flight" | "hotel" | "train" | "bus" | "insurance" | "cip" | "transfer" | "visa";
export type BookingOrder = { id: string; serviceType: string; serviceSnapshot: unknown; bookingStatus: string };
export type BookingRepository = {
  getBookingAttempt(orderId: string): Promise<{ id: string; status: string } | null>;
  createBookingAttempt(input: { orderId?: string; provider: string; providerReference?: string; status: string; requestSnapshot?: unknown; responseSnapshot?: unknown; error?: string }): Promise<{ id: string }>;
  updateBookingAttempt(id: string, input: { providerReference?: string; status: string; responseSnapshot?: unknown; error?: string }): Promise<unknown>;
  updateOrderBooking(orderId: string, input: { bookingStatus: string; providerName?: string; externalReference?: string; providerPayload?: Record<string, unknown> }): Promise<BookingOrder>;
};

const isItem = (value: unknown): value is SupplierItem => !!value && typeof value === "object" && typeof (value as SupplierItem).id === "string";

export class BookingService {
  constructor(private readonly providers: ProviderRegistry, private readonly repository: BookingRepository, private readonly executor = new ProviderExecutor()) {}

  private supplier(kind: string): TravelSupplier | undefined {
    return kind in this.providers && kind !== "sms" && kind !== "payment" ? this.providers[kind as SupplierKind] : undefined;
  }

  private selectedItem(kind: string, snapshot: unknown): SupplierItem {
    const service = snapshot && typeof snapshot === "object" ? snapshot as Record<string, unknown> : {};
    const candidate = kind === "flight" ? service.outbound : kind === "hotel" ? service.hotel : service.item;
    if (candidate !== undefined && !isItem(candidate)) throw new ProviderError("INVALID_REQUEST", "Selected supplier item is invalid", false);
    return isItem(candidate) ? candidate : { id: `${kind}-demo` };
  }

  async search(kind: SupplierKind, query: Record<string, unknown>, requestId = "internal") {
    const supplier = this.providers[kind];
    return this.executor.run(requestId, supplier.name, "search", () => supplier.search(query));
  }

  async validateSelection(kind: string, snapshot: unknown, requestId = "internal") {
    const supplier = this.supplier(kind);
    if (!supplier) return;
    const item = this.selectedItem(kind, snapshot);
    const validation = await this.executor.run(requestId, supplier.name, "validate", () => supplier.validate(item));
    if (!validation.valid) throw new ProviderError("INVALID_REQUEST", "Selected supplier item is unavailable", false, supplier.name);
  }

  async confirmOrder<T extends BookingOrder>(order: T, requestId = "internal"): Promise<BookingOrder> {
    const supplier = this.supplier(order.serviceType);
    if (!supplier) return order;
    const previous = await this.repository.getBookingAttempt(order.id);
    if (previous?.status === "CONFIRMED") return order;
    const item = this.selectedItem(order.serviceType, order.serviceSnapshot);
    let state: BookingState = transitionBooking("SEARCHED", "SELECTED");
    const attempt = await this.repository.createBookingAttempt({ orderId: order.id, provider: supplier.name, status: state, requestSnapshot: { itemId: item.id } });
    try {
      const validation = await this.executor.run(requestId, supplier.name, "validate", () => supplier.validate(item));
      if (!validation.valid) throw new ProviderError("INVALID_REQUEST", "Selected supplier item is unavailable", false, supplier.name);
      state = transitionBooking(state, "PRICE_VALIDATED");
      await this.repository.updateBookingAttempt(attempt.id, { status: state });
      const reservation = await this.executor.run(requestId, supplier.name, "reserve", () => supplier.reserve(item));
      state = transitionBooking(state, "RESERVED");
      await this.repository.updateBookingAttempt(attempt.id, { status: state, providerReference: reservation.providerReference, responseSnapshot: { reservationId: reservation.reservationId } });
      const confirmed = await this.executor.run(requestId, supplier.name, "confirm", () => supplier.confirm(reservation));
      state = transitionBooking(state, "CONFIRMED");
      await this.repository.updateBookingAttempt(attempt.id, { status: state, providerReference: confirmed.providerReference, responseSnapshot: { reservationId: confirmed.reservationId, status: confirmed.status } });
      return this.repository.updateOrderBooking(order.id, { bookingStatus: "confirmed", providerName: supplier.name, externalReference: confirmed.providerReference, providerPayload: { reservationId: confirmed.reservationId } });
    } catch (error) {
      if (!(error instanceof ProviderError)) throw error;
      await this.repository.updateBookingAttempt(attempt.id, { status: "FAILED", error: error instanceof ProviderError ? error.code : "PROVIDER_UNAVAILABLE" });
      return this.repository.updateOrderBooking(order.id, { bookingStatus: "reservation_failed", providerName: supplier.name });
    }
  }
}
