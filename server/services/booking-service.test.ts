import { describe, expect, it } from "vitest";
import { createProviderRegistry } from "../providers/registry.js";
import { ProviderError } from "../providers/types.js";
import { BookingService, type BookingOrder, type BookingRepository } from "./booking-service.js";

function fakeRepository() {
  const attempts: Array<{ id: string; orderId?: string; status: string; providerReference?: string; error?: string }> = [];
  const repository: BookingRepository = {
    getBookingAttempt: async (orderId) => [...attempts].reverse().find((entry) => entry.orderId === orderId) ?? null,
    createBookingAttempt: async (input) => {
      const attempt = { id: String(attempts.length + 1), ...input };
      attempts.push(attempt);
      return attempt;
    },
    updateBookingAttempt: async (id, input) => { Object.assign(attempts.find((entry) => entry.id === id)!, input); },
    updateOrderBooking: async (orderId, input) => ({ id: orderId, serviceType: "flight", serviceSnapshot: {}, ...input }),
  };
  return { attempts, repository };
}

describe("BookingService", () => {
  it("validates a selection and records a confirmed supplier booking once", async () => {
    const registry = createProviderRegistry();
    const { attempts, repository } = fakeRepository();
    const service = new BookingService(registry, repository);
    const item = (await service.search("flight", {}))[1];
    const order: BookingOrder = { id: "order-1", serviceType: "flight", serviceSnapshot: { outbound: item }, bookingStatus: "payment_pending" };
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
    const result = await service.confirmOrder({ id: "order-2", serviceType: "flight", serviceSnapshot: {}, bookingStatus: "payment_pending" });
    expect(result.bookingStatus).toBe("reservation_failed");
    expect(attempts[0]).toMatchObject({ status: "FAILED", error: "PROVIDER_UNAVAILABLE" });
  });
});
