import { describe, expect, it } from "vitest";
import { MockPaymentGateway } from "../providers/payment.js";
import { ProviderExecutor } from "../providers/execute.js";
import { PaymentService, type PaymentRepository } from "./payment-service.js";

function fakeRepository() {
  const intents = new Map<string, { checkoutSessionId: string; userId: string; provider: string; method: string; idempotencyKey: string; externalReference: string; redirectUrl: string; status: string }>();
  const callbacks = new Map<string, string>();
  const verifications: string[] = [];
  let finalized = 0;
  const repository: PaymentRepository = {
    createPaymentIntent: async (input) => { intents.set(input.externalReference, { ...input, status: "pending" }); },
    getPaymentIntentByKey: async (checkoutSessionId, idempotencyKey) => [...intents.values()].find((item) => item.checkoutSessionId === checkoutSessionId && item.idempotencyKey === idempotencyKey) ?? null,
    getPaymentIntentByReference: async (externalReference) => intents.get(externalReference) ?? null,
    recordPaymentCallback: async (input) => {
      const previous = callbacks.get(input.callbackKey);
      if (previous && previous !== input.status) throw new Error("conflicting callback");
      callbacks.set(input.callbackKey, input.status);
      intents.get(input.paymentIntentReference)!.status = input.status;
      return { duplicate: !!previous };
    },
    recordPaymentVerification: async (input) => { verifications.push(input.status); },
    finalizePayment: async (checkoutSessionId) => { finalized += 1; return { order: { id: checkoutSessionId, bookingStatus: "confirmed" } }; },
  };
  return { repository, intents, callbacks, verifications, get finalized() { return finalized; } };
}

const input = { checkoutSessionId: "checkout-1", userId: "user-1", method: "online_mock", amount: 1000, currency: "TOMAN", idempotencyKey: "payment-key", callbackUrl: "http://localhost:8787/api/payments/callback/mock" };

describe("PaymentService", () => {
  it("creates an intent and finalizes an authenticated callback idempotently", async () => {
    const gateway = new MockPaymentGateway();
    const state = fakeRepository();
    const service = new PaymentService(gateway, state.repository);
    const intent = await service.createIntent(input);
    expect(intent.redirectUrl).toContain("/checkout/gateway?reference=");
    expect((await service.createIntent(input)).externalReference).toBe(intent.externalReference);
    const callback = gateway.createTestCallback(intent.externalReference, "succeeded", { order: "demo" });
    expect((await service.handleCallback(callback)).duplicate).toBe(false);
    expect((await service.handleCallback(callback)).duplicate).toBe(true);
    expect(state.callbacks.size).toBe(1);
    expect(state.verifications).toEqual(["succeeded"]);
  });

  it("rejects unsigned and tampered callbacks before touching persistence", async () => {
    const gateway = new MockPaymentGateway();
    const state = fakeRepository();
    const service = new PaymentService(gateway, state.repository);
    const intent = await service.createIntent(input);
    const valid = gateway.createTestCallback(intent.externalReference, "succeeded");
    await expect(service.handleCallback({ ...valid, signature: undefined })).rejects.toMatchObject({ code: "INVALID_CALLBACK" });
    await expect(service.handleCallback({ ...valid, status: "failed" })).rejects.toMatchObject({ code: "INVALID_CALLBACK" });
    expect(state.callbacks.size).toBe(0);
    expect(state.finalized).toBe(0);
  });

  it("records a failed callback without finalizing payment", async () => {
    const gateway = new MockPaymentGateway();
    const state = fakeRepository();
    const service = new PaymentService(gateway, state.repository);
    const intent = await service.createIntent(input);
    await expect(service.handleCallback(gateway.createTestCallback(intent.externalReference, "failed"))).rejects.toMatchObject({ code: "PAYMENT_FAILED" });
    expect((await service.handleCallback(gateway.createTestCallback(intent.externalReference, "failed"))).duplicate).toBe(true);
    expect(state.verifications).toEqual(["failed"]);
    expect(state.finalized).toBe(0);
  });

  it("normalizes provider timeout", async () => {
    const gateway = new MockPaymentGateway();
    gateway.createPayment = async () => new Promise(() => {});
    const service = new PaymentService(gateway, fakeRepository().repository, new ProviderExecutor(5));
    await expect(service.createIntent(input)).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
  });

  it("supports mock refund through the gateway interface", async () => {
    const gateway = new MockPaymentGateway();
    const service = new PaymentService(gateway, fakeRepository().repository);
    const intent = await service.createIntent(input);
    await service.handleCallback(gateway.createTestCallback(intent.externalReference, "succeeded"));
    const refunded = await service.refund(intent.externalReference, 1000, "test");
    expect(refunded.status).toBe("refunded");
    expect((await service.refund(intent.externalReference, 1000, "test")).providerReference).toBe(refunded.providerReference);
    await expect(service.refund(intent.externalReference, 1001, "test")).rejects.toMatchObject({ code: "INVALID_REQUEST" });
  });

  it("simulates failure and cancellation only for the intent owner", async () => {
    const gateway = new MockPaymentGateway();
    const state = fakeRepository();
    const service = new PaymentService(gateway, state.repository);
    const intent = await service.createIntent(input);
    await expect(service.simulateMock(intent.externalReference, "another-user", "succeeded")).rejects.toMatchObject({ code: "NOT_FOUND" });
    const failed = await service.simulateMock(intent.externalReference, input.userId, "failed");
    expect(failed.verification.status).toBe("failed");
    expect(state.finalized).toBe(0);
    const repeated = await service.simulateMock(intent.externalReference, input.userId, "failed");
    expect(repeated.duplicate).toBe(true);
  });
});
