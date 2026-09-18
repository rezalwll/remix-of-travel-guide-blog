import type { PaymentGateway, PaymentCallback, PaymentVerification } from "../providers/payment.js";
import { ProviderError } from "../providers/types.js";
import { ProviderExecutor } from "../providers/execute.js";

export type PaymentRepository = {
  createPaymentIntent(input: { checkoutSessionId: string; userId: string; provider: string; method: string; amount: number; currency: string; idempotencyKey: string; externalReference: string; redirectUrl: string; metadata?: Record<string, unknown> }): Promise<unknown>;
  getPaymentIntentByKey(checkoutSessionId: string, idempotencyKey: string): Promise<{ externalReference: string; redirectUrl: string; provider: string; status: string } | null>;
  getPaymentIntentByReference(externalReference: string): Promise<{ checkoutSessionId: string; userId: string | null; provider: string; method: string; idempotencyKey: string; status: string } | null>;
  recordPaymentCallback(input: { paymentIntentReference: string; provider: string; status: string; payload?: Record<string, unknown>; signature?: string; callbackKey: string }): Promise<{ duplicate: boolean }>;
  recordPaymentVerification(input: { paymentIntentReference: string; provider: string; status: string; providerPayload?: Record<string, unknown>; errorCode?: string }): Promise<unknown>;
  finalizePayment(checkoutSessionId: string, userId: string, idempotencyKey: string, method: string, metadata?: Record<string, unknown>, providerData?: { provider: string; externalReference?: string; payload?: Record<string, unknown> }): Promise<unknown>;
};

export class PaymentService {
  constructor(private readonly gateway: PaymentGateway, private readonly repository: PaymentRepository, private readonly executor = new ProviderExecutor()) {}

  async createIntent(input: { checkoutSessionId: string; userId: string; method: string; amount: number; currency: string; idempotencyKey: string; callbackUrl: string; metadata?: Record<string, unknown>; requestId?: string }) {
    const existing = await this.repository.getPaymentIntentByKey(input.checkoutSessionId, input.idempotencyKey);
    if (existing) return existing;
    const created = await this.executor.run(input.requestId ?? "internal", this.gateway.name, "createPayment", () => this.gateway.createPayment({ ...input, idempotencyKey: `${input.checkoutSessionId}:${input.idempotencyKey}` }));
    try {
      await this.repository.createPaymentIntent({ ...input, provider: created.provider, externalReference: created.externalReference, redirectUrl: created.redirectUrl });
    } catch (error) {
      const concurrent = await this.repository.getPaymentIntentByKey(input.checkoutSessionId, input.idempotencyKey);
      if (concurrent) return concurrent;
      throw error;
    }
    return created;
  }

  async handleCallback(callback: PaymentCallback, requestId = "internal", allowFailure = false) {
    if (!this.gateway.verifyCallbackSignature(callback)) throw new ProviderError("INVALID_CALLBACK", "Payment callback signature is invalid", false, this.gateway.name);
    const intent = await this.repository.getPaymentIntentByReference(callback.externalReference);
    if (!intent || intent.provider !== this.gateway.name || !intent.userId) throw new ProviderError("INVALID_CALLBACK", "Payment intent does not match provider", false, this.gateway.name);
    if (intent.status === "failed" || intent.status === "cancelled") {
      if (intent.status === callback.status) return { duplicate: true, verification: { status: callback.status, externalReference: callback.externalReference } };
      throw new ProviderError("INVALID_CALLBACK", "Payment intent is terminal", false, this.gateway.name);
    }
    const verification: PaymentVerification = await this.executor.run(requestId, this.gateway.name, "verifyPayment", () => this.gateway.verifyPayment({ externalReference: callback.externalReference, callback }));
    if (verification.externalReference !== callback.externalReference || verification.status !== callback.status) throw new ProviderError("INVALID_CALLBACK", "Payment verification does not match callback", false, this.gateway.name);
    const callbackResult = await this.repository.recordPaymentCallback({ paymentIntentReference: callback.externalReference, provider: this.gateway.name, status: callback.status, payload: callback.payload, signature: callback.signature, callbackKey: `${this.gateway.name}:${callback.externalReference}` });
    if (!callbackResult.duplicate) await this.repository.recordPaymentVerification({ paymentIntentReference: callback.externalReference, provider: this.gateway.name, status: verification.status, providerPayload: verification.providerPayload, errorCode: verification.errorCode });
    if (verification.status !== "succeeded") {
      if (allowFailure) return { duplicate: callbackResult.duplicate, verification };
      throw new ProviderError(verification.status === "failed" ? "PAYMENT_FAILED" : "INVALID_CALLBACK", "پرداخت تکمیل نشد", false, this.gateway.name);
    }
    const result = await this.repository.finalizePayment(intent.checkoutSessionId, intent.userId, intent.idempotencyKey, intent.method, undefined, { provider: this.gateway.name, externalReference: callback.externalReference, payload: verification.providerPayload });
    return { duplicate: callbackResult.duplicate, verification, result };
  }

  async pay(input: { checkoutSessionId: string; userId: string; method: string; idempotencyKey: string; amount: number; currency: string; callbackUrl: string; metadata?: Record<string, unknown>; requestId?: string }) {
    const intent = await this.createIntent(input);
    const externalReference = (intent as { externalReference: string }).externalReference;
    if (!this.gateway.createTestCallback) throw new ProviderError("INVALID_REQUEST", "Synchronous payment is only available for the mock gateway", false, this.gateway.name);
    return this.handleCallback(this.gateway.createTestCallback(externalReference, "succeeded", input.metadata), input.requestId);
  }

  refund(externalReference: string, amount: number, reason: string, requestId = "internal") {
    return this.executor.run(requestId, this.gateway.name, "refund", () => this.gateway.refundPayment({ externalReference, amount, reason }));
  }

  async simulateMock(externalReference: string, userId: string, status: PaymentCallback["status"], requestId = "internal") {
    if (this.gateway.name !== "mock" || !this.gateway.createTestCallback) throw new ProviderError("INVALID_REQUEST", "Mock simulation is unavailable", false, this.gateway.name);
    const intent = await this.repository.getPaymentIntentByReference(externalReference);
    if (!intent || intent.userId !== userId || intent.provider !== this.gateway.name) throw new ProviderError("NOT_FOUND", "Payment intent was not found", false, this.gateway.name);
    return this.handleCallback(this.gateway.createTestCallback(externalReference, status), requestId, true);
  }
}
