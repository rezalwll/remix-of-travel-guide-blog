export type ProviderOperation = "search" | "validate" | "reserve" | "confirm" | "cancel" | "refund" | "send" | "checkStatus" | "createPayment" | "verifyPayment";

export type ProviderErrorCode = "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "INVALID_REQUEST" | "INVALID_CALLBACK" | "PAYMENT_FAILED" | "DUPLICATE_CALLBACK" | "NOT_FOUND" | "PRICE_CHANGED" | "SOLD_OUT" | "OFFER_EXPIRED";

export class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
    public readonly retryable = false,
    public readonly provider?: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export type ProviderResult<T> = { data: T; provider: string; durationMs?: number };
