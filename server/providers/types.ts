export type ProviderOperation = "search" | "validate" | "reserve" | "confirm" | "cancel" | "refund" | "send" | "checkStatus" | "createPayment" | "verifyPayment" | "health";

export type ProviderErrorCode = "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "INVALID_REQUEST" | "INVALID_CALLBACK" | "PAYMENT_FAILED" | "DUPLICATE_CALLBACK" | "NOT_FOUND" | "PRICE_CHANGED" | "SOLD_OUT" | "OFFER_EXPIRED";
export type ProviderErrorCategory = "CONFIGURATION" | "AUTHENTICATION" | "RATE_LIMIT" | "TIMEOUT" | "UNAVAILABLE" | "VALIDATION" | "REJECTED" | "CONFLICT" | "MALFORMED_RESPONSE" | "UNKNOWN_RESULT";
export type ProviderLifecycle = "UNCONFIGURED" | "DISABLED" | "SANDBOX" | "READY" | "ACTIVE" | "DEGRADED";

const categoryByCode: Record<ProviderErrorCode, ProviderErrorCategory> = {
  PROVIDER_TIMEOUT: "TIMEOUT", PROVIDER_UNAVAILABLE: "UNAVAILABLE", INVALID_REQUEST: "VALIDATION",
  INVALID_CALLBACK: "AUTHENTICATION", PAYMENT_FAILED: "REJECTED", DUPLICATE_CALLBACK: "CONFLICT",
  NOT_FOUND: "REJECTED", PRICE_CHANGED: "CONFLICT", SOLD_OUT: "REJECTED", OFFER_EXPIRED: "REJECTED",
};

export class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
    public readonly retryable = false,
    public readonly provider?: string,
    public readonly details?: Record<string, unknown>,
    public readonly category: ProviderErrorCategory = categoryByCode[code],
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export const providerErrorStatus = (error: ProviderError) => error.category === "TIMEOUT" ? 504
  : error.category === "UNAVAILABLE" || error.category === "RATE_LIMIT" ? 503
  : error.code === "PAYMENT_FAILED" ? 402
  : error.code === "NOT_FOUND" ? 404
  : error.category === "CONFLICT" ? 409
  : error.category === "CONFIGURATION" ? 503
  : 400;

export type ProviderResult<T> = { data: T; provider: string; durationMs?: number };
