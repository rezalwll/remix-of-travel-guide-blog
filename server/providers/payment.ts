import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ProviderError } from "./types.js";

export type PaymentStatus = "created" | "pending" | "succeeded" | "failed" | "cancelled" | "refunded";
export type CreatePaymentInput = { amount: number; currency: string; idempotencyKey: string; callbackUrl: string; metadata?: Record<string, unknown> };
export type CreatePaymentResult = { provider: string; externalReference: string; redirectUrl: string; status: PaymentStatus; payload: Record<string, unknown> };
export type PaymentCallback = { externalReference: string; status: "succeeded" | "failed" | "cancelled"; signature?: string; payload?: Record<string, unknown> };
export type PaymentVerification = { status: "pending" | "unknown" | "succeeded" | "failed" | "cancelled"; externalReference: string; providerPayload?: Record<string, unknown>; errorCode?: string };

export interface PaymentGateway {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: { externalReference: string; callback?: PaymentCallback }): Promise<PaymentVerification>;
  refundPayment(input: { externalReference: string; amount: number; reason?: string; idempotencyKey: string }): Promise<{ status: "refunded" | "pending"; providerReference: string }>;
  verifyCallbackSignature(callback: PaymentCallback): boolean;
  createTestCallback?(externalReference: string, status: PaymentCallback["status"], payload?: Record<string, unknown>): PaymentCallback;
}

export class MockPaymentGateway implements PaymentGateway {
  readonly name = "mock";
  private readonly payments = new Map<string, PaymentStatus>();
  private readonly amounts = new Map<string, number>();
  private readonly intentsByKey = new Map<string, CreatePaymentResult>();
  private readonly refunds = new Map<string, string>();
  private readonly secret: string;

  constructor(secret = "mock-callback-secret", private readonly webOrigin = "http://localhost:8080") { this.secret = secret; }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (input.amount <= 0) throw new ProviderError("INVALID_REQUEST", "Payment amount must be positive", false, this.name);
    const existing = this.intentsByKey.get(input.idempotencyKey);
    if (existing) {
      if (existing.payload.amount !== input.amount || existing.payload.currency !== input.currency) throw new ProviderError("INVALID_REQUEST", "Idempotency key belongs to a different payment", false, this.name);
      return existing;
    }
    const externalReference = `MOCK-PAY-${randomUUID().replaceAll("-", "").slice(0, 18).toUpperCase()}`;
    this.payments.set(externalReference, "pending");
    this.amounts.set(externalReference, input.amount);
    const redirect = new URL("/checkout/gateway", this.webOrigin);
    redirect.searchParams.set("reference", externalReference);
    redirect.searchParams.set("amount", String(input.amount));
    const result = { provider: this.name, externalReference, redirectUrl: redirect.toString(), status: "created" as const, payload: { amount: input.amount, currency: input.currency, metadata: input.metadata ?? {} } };
    this.intentsByKey.set(input.idempotencyKey, result);
    return result;
  }

  async verifyPayment(input: { externalReference: string; callback?: PaymentCallback }): Promise<PaymentVerification> {
    const current = this.payments.get(input.externalReference) ?? (input.externalReference.startsWith("MOCK-PAY-") ? "pending" : undefined);
    if (!current) throw new ProviderError("NOT_FOUND", "Payment reference was not found", false, this.name);
    if (current === "refunded") throw new ProviderError("INVALID_REQUEST", "Payment was already refunded", false, this.name);
    if ((current === "failed" || current === "cancelled") && input.callback?.status !== current) throw new ProviderError("INVALID_CALLBACK", "Payment status is terminal", false, this.name);
    const status = input.callback?.status ?? (current === "pending" || current === "created" ? "pending" : current === "succeeded" ? "succeeded" : current === "cancelled" ? "cancelled" : "failed");
    const next: PaymentStatus = status;
    this.payments.set(input.externalReference, next);
    return { status, externalReference: input.externalReference, providerPayload: input.callback?.payload };
  }

  async refundPayment(input: { externalReference: string; amount: number; reason?: string; idempotencyKey: string }) {
    const knownAmount = this.amounts.get(input.externalReference);
    if (input.amount <= 0 || (knownAmount !== undefined && input.amount > knownAmount)) throw new ProviderError("INVALID_REQUEST", "Refund amount is invalid", false, this.name);
    const refundKey = `${input.externalReference}:${input.idempotencyKey}`;
    const previous = this.refunds.get(refundKey);
    if (previous) return { status: "refunded" as const, providerReference: previous };
    const status = this.payments.get(input.externalReference);
    if (status !== "succeeded" && !(status === undefined && input.externalReference.startsWith("MOCK-PAY-"))) throw new ProviderError("INVALID_REQUEST", "Payment is not settled", false, this.name);
    const providerReference = `MOCK-REF-${createHash("sha256").update(refundKey).digest("hex").slice(0, 12).toUpperCase()}`;
    this.refunds.set(refundKey, providerReference);
    this.payments.set(input.externalReference, "refunded");
    return { status: "refunded" as const, providerReference };
  }

  createTestCallback(externalReference: string, status: PaymentCallback["status"], payload?: Record<string, unknown>): PaymentCallback {
    const callback = { externalReference, status, payload };
    return { ...callback, signature: this.sign(callback) };
  }

  verifyCallbackSignature(callback: PaymentCallback) {
    if (!callback.signature || !/^[0-9a-f]{64}$/i.test(callback.signature)) return false;
    const expected = Buffer.from(this.sign(callback), "hex");
    const received = Buffer.from(callback.signature, "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
  }

  private sign(callback: Pick<PaymentCallback, "externalReference" | "status" | "payload">) {
    return createHmac("sha256", this.secret).update(JSON.stringify({ externalReference: callback.externalReference, status: callback.status, payload: callback.payload ?? {} })).digest("hex");
  }
}
