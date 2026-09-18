import { createHmac, randomUUID } from "node:crypto";
import { ProviderError } from "./types.js";

export type PaymentStatus = "created" | "pending" | "succeeded" | "failed" | "cancelled" | "refunded";
export type CreatePaymentInput = { amount: number; currency: string; idempotencyKey: string; callbackUrl: string; metadata?: Record<string, unknown> };
export type CreatePaymentResult = { provider: string; externalReference: string; redirectUrl: string; status: PaymentStatus; payload: Record<string, unknown> };
export type PaymentCallback = { externalReference: string; status: "succeeded" | "failed" | "cancelled"; signature?: string; payload?: Record<string, unknown> };
export type PaymentVerification = { status: "succeeded" | "failed" | "cancelled"; externalReference: string; providerPayload?: Record<string, unknown>; errorCode?: string };

export interface PaymentGateway {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: { externalReference: string; callback?: PaymentCallback }): Promise<PaymentVerification>;
  refundPayment(input: { externalReference: string; amount: number; reason?: string }): Promise<{ status: "refunded" | "pending"; providerReference: string }>;
  verifyCallbackSignature(payload: unknown, signature?: string): boolean;
}

export class MockPaymentGateway implements PaymentGateway {
  readonly name = "mock";
  private readonly payments = new Map<string, PaymentStatus>();
  private readonly secret: string;

  constructor(secret = "mock-callback-secret") { this.secret = secret; }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (input.amount <= 0) throw new ProviderError("INVALID_REQUEST", "Payment amount must be positive", false, this.name);
    const externalReference = `MOCK-PAY-${randomUUID().replaceAll("-", "").slice(0, 18).toUpperCase()}`;
    this.payments.set(externalReference, "pending");
    return { provider: this.name, externalReference, redirectUrl: `${input.callbackUrl}?reference=${externalReference}`, status: "created", payload: { amount: input.amount, currency: input.currency, metadata: input.metadata ?? {} } };
  }

  async verifyPayment(input: { externalReference: string; callback?: PaymentCallback }): Promise<PaymentVerification> {
    const current = this.payments.get(input.externalReference);
    if (!current) throw new ProviderError("NOT_FOUND", "Payment reference was not found", false, this.name);
    const status = input.callback?.status ?? (current === "pending" ? "succeeded" : current === "succeeded" ? "succeeded" : "failed");
    const next: PaymentStatus = status;
    this.payments.set(input.externalReference, next);
    return { status, externalReference: input.externalReference, providerPayload: input.callback?.payload };
  }

  async refundPayment(input: { externalReference: string; amount: number; reason?: string }) {
    if (!this.payments.has(input.externalReference)) throw new ProviderError("NOT_FOUND", "Payment reference was not found", false, this.name);
    this.payments.set(input.externalReference, "refunded");
    return { status: "refunded" as const, providerReference: `MOCK-REF-${randomUUID().slice(0, 12).toUpperCase()}` };
  }

  verifyCallbackSignature(payload: unknown, signature?: string) {
    if (!signature) return true;
    const body = JSON.stringify(payload ?? {});
    const expected = createHmac("sha256", this.secret).update(body).digest("hex");
    return signature === expected || signature === "mock-valid";
  }
}
