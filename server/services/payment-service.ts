import type { PaymentGateway, PaymentCallback, PaymentVerification } from "../providers/payment.js";
import { ProviderError } from "../providers/types.js";

export type PaymentRepository = {
  createPaymentIntent(input: { checkoutSessionId: string; userId: string; provider: string; method: string; amount: number; currency: string; idempotencyKey: string; externalReference: string; redirectUrl: string; metadata?: Record<string, unknown> }): Promise<unknown>;
  getPaymentIntentByKey(checkoutSessionId: string, idempotencyKey: string): Promise<{ externalReference: string; redirectUrl: string; provider: string; status: string } | null>;
  recordPaymentCallback(input: { paymentIntentReference: string; provider: string; status: string; payload?: Record<string, unknown>; signature?: string; callbackKey: string }): Promise<{ duplicate: boolean }>;
  recordPaymentVerification(input: { paymentIntentReference: string; provider: string; status: string; providerPayload?: Record<string, unknown>; errorCode?: string }): Promise<unknown>;
  finalizePayment(checkoutSessionId: string, userId: string, idempotencyKey: string, method: string, metadata?: Record<string, unknown>, providerData?: { provider: string; externalReference?: string; payload?: Record<string, unknown> }): Promise<unknown>;
};

export class PaymentService {
  constructor(private readonly gateway: PaymentGateway, private readonly repository: PaymentRepository) {}

  async createIntent(input: { checkoutSessionId: string; userId: string; method: string; amount: number; currency: string; idempotencyKey: string; callbackUrl: string; metadata?: Record<string, unknown> }) {
    const existing = await this.repository.getPaymentIntentByKey(input.checkoutSessionId, input.idempotencyKey);
    if (existing) return existing;
    const created = await this.gateway.createPayment(input);
    await this.repository.createPaymentIntent({ ...input, provider: created.provider, externalReference: created.externalReference, redirectUrl: created.redirectUrl });
    return created;
  }

  async handleCallback(input: { checkoutSessionId: string; userId: string; method: string; idempotencyKey: string; externalReference: string; callback: PaymentCallback }) {
    if (!this.gateway.verifyCallbackSignature(input.callback.payload, input.callback.signature)) throw new ProviderError("INVALID_CALLBACK", "Payment callback signature is invalid", false, this.gateway.name);
    const callbackResult = await this.repository.recordPaymentCallback({ paymentIntentReference: input.externalReference, provider: this.gateway.name, status: input.callback.status, payload: input.callback.payload, signature: input.callback.signature, callbackKey: `${this.gateway.name}:${input.externalReference}:${input.callback.status}` });
    if (callbackResult.duplicate) return { duplicate: true, verification: { status: input.callback.status, externalReference: input.externalReference } };
    const verification: PaymentVerification = await this.gateway.verifyPayment({ externalReference: input.externalReference, callback: input.callback });
    await this.repository.recordPaymentVerification({ paymentIntentReference: input.externalReference, provider: this.gateway.name, status: verification.status, providerPayload: verification.providerPayload, errorCode: verification.errorCode });
    if (verification.status !== "succeeded") throw new ProviderError(verification.status === "failed" ? "PAYMENT_FAILED" : "INVALID_CALLBACK", "پرداخت تکمیل نشد", false, this.gateway.name);
    const result = await this.repository.finalizePayment(input.checkoutSessionId, input.userId, input.idempotencyKey, input.method, undefined, { provider: this.gateway.name, externalReference: input.externalReference, payload: verification.providerPayload });
    return { duplicate: false, verification, result };
  }

  async pay(input: { checkoutSessionId: string; userId: string; method: string; idempotencyKey: string; amount: number; currency: string; callbackUrl: string; metadata?: Record<string, unknown> }) {
    const intent = await this.createIntent(input);
    const externalReference = (intent as { externalReference: string }).externalReference;
    const handled = await this.handleCallback({ checkoutSessionId: input.checkoutSessionId, userId: input.userId, method: input.method, idempotencyKey: input.idempotencyKey, externalReference, callback: { externalReference, status: "succeeded", payload: input.metadata } });
    if (handled.duplicate) return { ...handled, result: await this.repository.finalizePayment(input.checkoutSessionId, input.userId, input.idempotencyKey, input.method, input.metadata, { provider: this.gateway.name, externalReference }) };
    return handled;
  }
}
