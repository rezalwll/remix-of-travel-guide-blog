import { describe, expect, it } from "vitest";
import { createProviderRegistry } from "../providers/registry.js";
import { ProviderError } from "../providers/types.js";
import { BookingService, type BookingOrder, type BookingRepository } from "./booking-service.js";
import { MockTravelSupplier } from "../providers/travel.js";

function fakeRepository() {
  const attempts: Array<{ id: string; orderId?: string; requestKey: string; status: string; providerReference?: string; error?: string }> = [];
  const repository: BookingRepository = {
    getBookingAttempt: async (orderId) => [...attempts].reverse().find((entry) => entry.orderId === orderId) ?? null,
    createBookingAttempt: async (input) => {
      const attempt = { id: String(attempts.length + 1), ...input };
      attempts.push(attempt);
      return attempt;
    },
    updateBookingAttempt: async (id, input) => { Object.assign(attempts.find((entry) => entry.id === id)!, input); },
    updateOrderBooking: async (orderId, input) => ({ id: orderId, serviceType: "flight", serviceSnapshot: {}, ...input }),
    listUnresolvedBookings: async () => [],
  };
  return { attempts, repository };
}

describe("BookingService", () => {
  it("validates a selection and records a confirmed supplier booking once", async () => {
    const registry = createProviderRegistry();
    const { attempts, repository } = fakeRepository();
    const service = new BookingService(registry, repository);
    const item = (await service.search("flight", {}))[1];
    const order: BookingOrder = { id: "order-1", serviceType: "flight", serviceSnapshot: { outbound: item }, bookingStatus: "paid_booking_pending" };
    await service.validateSelection("flight", order.serviceSnapshot);
    const confirmed = await service.confirmOrder(order);
    expect(confirmed.bookingStatus).toBe("confirmed");
    expect(attempts).toMatchObject([{ orderId: "order-1", status: "CONFIRMED", provider: "flight-mock" }]);
    await service.confirmOrder(confirmed);
    expect(attempts).toHaveLength(1);
  });

  it("rejects an unavailable item before checkout", async () => {
    const service = new BookingService(createProviderRegistry(), fakeRepository().repository);
    await expect(service.validateSelection("hotel", { hotel: { id: "unknown" } })).rejects.toMatchObject({ code: "INVALID_REQUEST" });
  });

  it("records provider failure without claiming a confirmed booking", async () => {
    const registry = createProviderRegistry();
    registry.flight.reserve = async () => { throw new ProviderError("PROVIDER_UNAVAILABLE", "down", true, "flight-mock"); };
    const { attempts, repository } = fakeRepository();
    const service = new BookingService(registry, repository);
    const result = await service.confirmOrder({ id: "order-2", serviceType: "flight", serviceSnapshot: {}, bookingStatus: "paid_booking_pending" });
    expect(result.bookingStatus).toBe("reservation_failed");
    expect(attempts[0]).toMatchObject({ status: "FAILED", error: "PROVIDER_UNAVAILABLE" });
  });

  it.each([
    ["PRICE_CHANGED", { id: "offer", price: 90 }, { id: "offer", price: 100 }],
    ["SOLD_OUT", { id: "offer" }, { id: "offer", mockAvailability: "sold_out" }],
    ["EXPIRED", { id: "offer" }, { id: "offer", mockAvailability: "expired" }],
    ["PROVIDER_UNAVAILABLE", { id: "offer" }, { id: "offer", mockAvailability: "unavailable" }],
  ] as const)("returns structured %s revalidation", async (outcome, selected, trusted) => {
    const registry = createProviderRegistry();
    registry.flight = new MockTravelSupplier("flight-mock", [trusted]);
    const service = new BookingService(registry, fakeRepository().repository);
    await expect(service.revalidateCheckout({ id: "checkout", serviceType: "flight", service: { outbound: selected }, total: 100, expiresAt: new Date(Date.now() + 60_000), status: "ready_for_payment" })).rejects.toMatchObject({ code: outcome === "EXPIRED" ? "OFFER_EXPIRED" : outcome, details: { outcome } });
  });

  it("keeps timeout UNKNOWN and reconciles a later supplier confirmation", async () => {
    const registry = createProviderRegistry();
    const supplier = new MockTravelSupplier("flight-mock", [{ id: "offer", price: 100, mockBookingOutcome: "unknown" }]);
    registry.flight = supplier;
    const attempts: Array<{ id: string; orderId: string; requestKey: string; status: string; providerReference?: string }> = [];
    const order: BookingOrder & { bookingAttempts: typeof attempts } = { id: "order-unknown", serviceType: "flight", serviceSnapshot: { outbound: { id: "offer", price: 100 } }, bookingStatus: "paid_booking_pending", bookingAttempts: attempts };
    const repository: BookingRepository = {
      getBookingAttempt: async () => attempts[0] ?? null,
      createBookingAttempt: async (input) => { const attempt = { id: "attempt-1", orderId: input.orderId!, requestKey: input.requestKey, status: input.status, providerReference: input.providerReference }; attempts.push(attempt); return attempt; },
      updateBookingAttempt: async (_id, input) => { Object.assign(attempts[0], input); },
      updateOrderBooking: async (_id, input) => Object.assign(order, input),
      listUnresolvedBookings: async () => [{ ...order, bookingAttempts: attempts }],
    };
    const service = new BookingService(registry, repository);
    expect((await service.confirmOrder(order)).bookingStatus).toBe("manual_review_required");
    expect(attempts[0].status).toBe("UNKNOWN");
    supplier.resolveUnknown(attempts[0].requestKey, "CONFIRMED", { id: "offer", price: 100 });
    const reconciled = await service.reconcile();
    expect(reconciled[0]).toMatchObject({ outcome: "CONFIRMED", order: { bookingStatus: "confirmed" } });
  });
});
