import type { ProviderRegistry } from "../providers/registry.js";
import type { SupplierItem, TravelSupplier } from "../providers/travel.js";
import { ProviderError } from "../providers/types.js";
import { ProviderExecutor } from "../providers/execute.js";
import type { OrderBookingState } from "../domain/states.js";

export type SupplierKind = "flight" | "hotel" | "train" | "bus" | "insurance" | "cip" | "transfer" | "visa";
export type BookingOrder = { id: string; serviceType: string; serviceSnapshot: unknown; bookingStatus: string; providerName?: string | null; externalReference?: string | null };
export type CheckoutForRevalidation = { id: string; serviceType: string; service: unknown; total: number; expiresAt: Date | string; status: string };
export type BookingRepository = {
  getBookingAttempt(orderId: string): Promise<{ id: string; requestKey: string; status: string; providerReference?: string | null } | null>;
  createBookingAttempt(input: { orderId?: string; requestKey: string; provider: string; providerReference?: string; status: string; requestSnapshot?: unknown; responseSnapshot?: unknown; error?: string }): Promise<{ id: string; status: string; providerReference?: string | null }>;
  updateBookingAttempt(id: string, input: { providerReference?: string; status: string; responseSnapshot?: unknown; error?: string }): Promise<unknown>;
  updateOrderBooking(orderId: string, input: { bookingStatus: OrderBookingState; providerName?: string; externalReference?: string; providerPayload?: Record<string, unknown> }): Promise<BookingOrder>;
  listUnresolvedBookings(limit?: number): Promise<Array<BookingOrder & { bookingAttempts: Array<{ id: string; requestKey: string; status: string; providerReference?: string | null }> }>>;
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

  async revalidateCheckout(checkout: CheckoutForRevalidation, requestId = "internal") {
    if (new Date(checkout.expiresAt) <= new Date()) throw new ProviderError("OFFER_EXPIRED", "مهلت این پیشنهاد به پایان رسیده است", false);
    if (checkout.status !== "ready_for_payment" && checkout.status !== "payment_pending") throw new ProviderError("INVALID_REQUEST", "وضعیت پرداخت این سفارش معتبر نیست", false);
    const supplier = this.supplier(checkout.serviceType);
    if (!supplier) return { outcome: "VALID" as const };
    const item = this.selectedItem(checkout.serviceType, checkout.service);
    const result = await this.executor.run(requestId, supplier.name, "validate", () => supplier.revalidate(item));
    if (result.outcome === "VALID") return result;
    const code = result.outcome === "EXPIRED" ? "OFFER_EXPIRED" : result.outcome;
    throw new ProviderError(code, result.outcome === "PRICE_CHANGED" ? "قیمت پیشنهاد تغییر کرده است؛ لطفاً نتیجهٔ جدید را بررسی کنید" : result.outcome === "SOLD_OUT" ? "ظرفیت این پیشنهاد تکمیل شده است" : result.outcome === "EXPIRED" ? "مهلت این پیشنهاد به پایان رسیده است" : "تأمین‌کننده موقتاً در دسترس نیست", result.outcome === "PROVIDER_UNAVAILABLE", supplier.name, { outcome: result.outcome, trustedPrice: result.trustedPrice });
  }

  async confirmOrder<T extends BookingOrder>(order: T, requestId = "internal"): Promise<BookingOrder> {
    const supplier = this.supplier(order.serviceType);
    if (!supplier) return order;
    const previous = await this.repository.getBookingAttempt(order.id);
    if (previous?.status === "CONFIRMED") return order;
    if (previous?.status === "UNKNOWN") return this.repository.updateOrderBooking(order.id, { bookingStatus: "manual_review_required", providerName: supplier.name, externalReference: previous.providerReference ?? undefined });
    const item = this.selectedItem(order.serviceType, order.serviceSnapshot);
    const requestKey = `booking:${order.id}:${supplier.name}`;
    const attempt = await this.repository.createBookingAttempt({ orderId: order.id, requestKey, provider: supplier.name, status: "SELECTED", requestSnapshot: { itemId: item.id } });
    let providerReference: string | undefined;
    try {
      const validation = await this.executor.run(requestId, supplier.name, "validate", () => supplier.revalidate(item));
      if (validation.outcome !== "VALID") throw new ProviderError(validation.outcome === "EXPIRED" ? "OFFER_EXPIRED" : validation.outcome, "Supplier revalidation failed", validation.outcome === "PROVIDER_UNAVAILABLE", supplier.name);
      await this.repository.updateBookingAttempt(attempt.id, { status: "PRICE_VALIDATED" });
      const reservation = await this.executor.run(requestId, supplier.name, "reserve", () => supplier.reserve(item, { idempotencyKey: requestKey }));
      providerReference = reservation.providerReference;
      await this.repository.updateBookingAttempt(attempt.id, { status: "RESERVED", providerReference, responseSnapshot: { reservationId: reservation.reservationId } });
      const confirmed = await this.executor.run(requestId, supplier.name, "confirm", () => supplier.confirm(reservation));
      await this.repository.updateBookingAttempt(attempt.id, { status: "CONFIRMED", providerReference: confirmed.providerReference, responseSnapshot: { reservationId: confirmed.reservationId, status: confirmed.status } });
      return this.repository.updateOrderBooking(order.id, { bookingStatus: "confirmed", providerName: supplier.name, externalReference: confirmed.providerReference, providerPayload: { reservationId: confirmed.reservationId } });
    } catch (error) {
      if (!(error instanceof ProviderError)) throw error;
      const unknown = error.code === "PROVIDER_TIMEOUT";
      await this.repository.updateBookingAttempt(attempt.id, { status: unknown ? "UNKNOWN" : "FAILED", providerReference, error: error.code });
      if (unknown) return this.repository.updateOrderBooking(order.id, { bookingStatus: "manual_review_required", providerName: supplier.name, externalReference: providerReference });
      return this.repository.updateOrderBooking(order.id, { bookingStatus: "reservation_failed", providerName: supplier.name });
    }
  }

  async reconcile(limit = 50, requestId = "reconcile") {
    const orders = await this.repository.listUnresolvedBookings(limit);
    const results: Array<{ order: BookingOrder; outcome: "CONFIRMED" | "FAILED" | "UNKNOWN" }> = [];
    for (const order of orders) {
      const supplier = this.supplier(order.serviceType);
      if (!supplier) continue;
      const attempt = order.bookingAttempts[0];
      if (!attempt) {
        const confirmed = await this.confirmOrder(order, requestId);
        results.push({ order: confirmed, outcome: confirmed.bookingStatus === "confirmed" ? "CONFIRMED" : confirmed.bookingStatus === "reservation_failed" ? "FAILED" : "UNKNOWN" });
        continue;
      }
      if (attempt.status !== "UNKNOWN") continue;
      const resolution = await this.executor.run(requestId, supplier.name, "checkStatus", () => supplier.checkReservation({ providerReference: attempt.providerReference ?? undefined, idempotencyKey: attempt.requestKey }));
      if (resolution.outcome === "CONFIRMED" && resolution.reservation) {
        await this.repository.updateBookingAttempt(attempt.id, { status: "CONFIRMED", providerReference: resolution.reservation.providerReference, responseSnapshot: { reservationId: resolution.reservation.reservationId, reconciled: true } });
        const updated = await this.repository.updateOrderBooking(order.id, { bookingStatus: "confirmed", providerName: supplier.name, externalReference: resolution.reservation.providerReference, providerPayload: { reservationId: resolution.reservation.reservationId } });
        results.push({ order: updated, outcome: "CONFIRMED" });
      } else if (resolution.outcome === "FAILED") {
        await this.repository.updateBookingAttempt(attempt.id, { status: "FAILED", error: resolution.errorCode ?? "RECONCILED_FAILED" });
        const updated = await this.repository.updateOrderBooking(order.id, { bookingStatus: "reservation_failed", providerName: supplier.name });
        results.push({ order: updated, outcome: "FAILED" });
      } else results.push({ order, outcome: "UNKNOWN" });
    }
    return results;
  }
}
