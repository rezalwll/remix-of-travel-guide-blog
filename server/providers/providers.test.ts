import { describe, expect, it, vi } from "vitest";
import { createProviderRegistry } from "./registry.js";
import { DevelopmentSmsProvider, sendSmsWithRetry, type SmsProvider } from "./sms.js";
import { ProviderExecutor } from "./execute.js";
import { ProviderError } from "./types.js";
import { MockTravelSupplier } from "./travel.js";
import { canTransitionBooking, transitionBooking } from "../domain/booking.js";
import { SmsService } from "../services/sms-service.js";
import { config } from "../config.js";

describe("SMS provider", () => {
  it("sends and tracks delivery without exposing the OTP", async () => {
    const provider = new DevelopmentSmsProvider();
    const result = await provider.send({ mobile: "09121234567", template: "login_otp", variables: { code: "12345" } });
    expect(result.status).toBe("sent");
    expect(await provider.checkStatus(result.providerReference!)).toBe("sent");
    expect(JSON.stringify(result)).not.toContain("12345");
  });

  it("retries failures through the interface", async () => {
    const send = vi.fn().mockResolvedValueOnce({ status: "failed" }).mockResolvedValueOnce({ status: "sent" });
    const provider: SmsProvider = { name: "test", send, checkStatus: async () => "sent" };
    expect((await sendSmsWithRetry(provider, { mobile: "09121234567", template: "otp", idempotencyKey: "sms-test-1" })).status).toBe("sent");
    expect(send).toHaveBeenCalledTimes(2);
    const failed = new DevelopmentSmsProvider({ fail: true });
    expect((await sendSmsWithRetry(failed, { mobile: "09121234567", template: "otp" })).status).toBe("failed");
  });

  it("records success and failure through SmsService", async () => {
    const records: string[] = [];
    const recorder = {
      createSmsDeliveryAttempt: async (input: { status: string }) => { records.push(input.status); return { id: "attempt-1" }; },
      updateSmsDeliveryAttempt: async (_id: string, input: { status: string }) => { records.push(input.status); },
    };
    const success = new SmsService(new DevelopmentSmsProvider(), recorder);
    await success.send({ mobile: "09121234567", template: "login_otp", variables: { code: "12345" } });
    const failed = new SmsService(new DevelopmentSmsProvider({ fail: true }), recorder);
    await expect(failed.send({ mobile: "09121234567", template: "login_otp", variables: { code: "12345" } })).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    expect(records).toEqual(["queued", "sent", "queued", "failed"]);
    expect(JSON.stringify(records)).not.toContain("12345");
  });
});

describe("supplier and booking foundation", () => {
  it("wraps the existing mock catalogs and supports reservation and cancellation", async () => {
    const registry = createProviderRegistry();
    for (const kind of ["flight", "hotel", "train", "bus"] as const) {
      const items = await registry[kind].search({});
      expect(items.length).toBeGreaterThan(1);
      const reservation = await registry[kind].reserve(items[1]);
      expect(reservation.providerReference).not.toBe(items[1].id);
      expect((await registry[kind].cancel(reservation)).status).toBe("cancelled");
    }
  });

  it("rejects unknown items and invalid supplier transitions", async () => {
    const supplier = new MockTravelSupplier("test", [{ id: "known", price: 100 }]);
    await expect(supplier.reserve({ id: "unknown" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    const reservation = await supplier.reserve({ id: "known", price: 1 });
    expect((await supplier.validate({ id: "known", price: 1 })).price).toBe(100);
    await supplier.cancel(reservation);
    await expect(supplier.confirm(reservation)).rejects.toMatchObject({ code: "INVALID_REQUEST" });
  });

  it("validates lifecycle transitions", () => {
    expect(transitionBooking("SEARCHED", "SELECTED")).toBe("SELECTED");
    expect(canTransitionBooking("RESERVED", "CONFIRMED")).toBe(true);
    expect(transitionBooking("CANCELLED", "REFUNDED")).toBe("REFUNDED");
    expect(() => transitionBooking("SEARCHED", "CONFIRMED")).toThrow("Invalid booking transition");
  });

  it("normalizes timeouts and logs only operational metadata", async () => {
    const logs: unknown[] = [];
    const executor = new ProviderExecutor(5, (entry) => logs.push(entry));
    await expect(executor.run("req-1", "mock", "search", () => new Promise(() => {}))).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT", retryable: true });
    expect(logs).toEqual([expect.objectContaining({ requestId: "req-1", provider: "mock", operation: "search", status: "PROVIDER_TIMEOUT" })]);
    expect(JSON.stringify(logs)).not.toContain("passport");
  });

  it("rejects unsupported provider configuration", () => {
    expect(() => createProviderRegistry({ ...config, FLIGHT_PROVIDER: "external" })).toThrow("not configured");
    expect(new ProviderError("PROVIDER_UNAVAILABLE", "down", true).retryable).toBe(true);
  });
});
