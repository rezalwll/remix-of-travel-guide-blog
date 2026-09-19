import { ProviderError, type ProviderErrorCategory } from "./types.js";
import { redactProviderData } from "./redaction.js";

export type HttpRetrySafety = "unsafe" | "safe" | "idempotent";
export type ProviderHttpRequest = {
  path: string; method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; headers?: Record<string, string>; body?: unknown;
  requestId: string; operation: string; retrySafety?: HttpRetrySafety; idempotencyKey?: string; signal?: AbortSignal;
};
export type ProviderHttpClientOptions = {
  provider: string; baseUrl: string; timeoutMs?: number; maxResponseBytes?: number; maxAttempts?: number; retryBudgetMs?: number;
  fetch?: typeof globalThis.fetch; log?: (entry: Record<string, unknown>) => void;
};

const mapStatus = (status: number): ProviderErrorCategory => status === 401 || status === 403 ? "AUTHENTICATION" : status === 429 ? "RATE_LIMIT" : status >= 500 ? "UNAVAILABLE" : status === 409 ? "CONFLICT" : "REJECTED";

export class ProviderHttpClient {
  private readonly baseUrl: URL;
  constructor(private readonly options: ProviderHttpClientOptions) {
    this.baseUrl = new URL(options.baseUrl);
    if (!["http:", "https:"].includes(this.baseUrl.protocol) || this.baseUrl.username || this.baseUrl.password) throw new ProviderError("INVALID_REQUEST", "Provider base URL is invalid", false, options.provider, undefined, "CONFIGURATION");
  }

  async request<T>(input: ProviderHttpRequest): Promise<T> {
    const method = input.method ?? "GET";
    const canRetry = input.retrySafety === "safe" || (input.retrySafety === "idempotent" && !!input.idempotencyKey);
    const maxAttempts = canRetry ? Math.max(1, this.options.maxAttempts ?? 3) : 1;
    const started = Date.now();
    let lastError: ProviderError | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const onAbort = () => controller.abort(input.signal?.reason);
      input.signal?.addEventListener("abort", onAbort, { once: true });
      const timer = setTimeout(() => controller.abort(new Error("timeout")), this.options.timeoutMs ?? 5_000);
      try {
        const url = new URL(input.path.replace(/^\//, ""), `${this.baseUrl.toString().replace(/\/$/, "")}/`);
        if (url.origin !== this.baseUrl.origin) throw new ProviderError("INVALID_REQUEST", "Cross-origin provider request was blocked", false, this.options.provider, undefined, "CONFIGURATION");
        const response = await (this.options.fetch ?? globalThis.fetch)(url, {
          method, signal: controller.signal,
          headers: { accept: "application/json", "content-type": "application/json", "x-request-id": input.requestId, ...(input.idempotencyKey ? { "idempotency-key": input.idempotencyKey } : {}), ...input.headers },
          body: input.body === undefined ? undefined : JSON.stringify(input.body),
        });
        const declared = Number(response.headers.get("content-length") ?? 0);
        const maxBytes = this.options.maxResponseBytes ?? 262_144;
        if (declared > maxBytes) throw new ProviderError("PROVIDER_UNAVAILABLE", "Provider response exceeded the size limit", false, this.options.provider, undefined, "MALFORMED_RESPONSE");
        const raw = await response.text();
        if (Buffer.byteLength(raw) > maxBytes) throw new ProviderError("PROVIDER_UNAVAILABLE", "Provider response exceeded the size limit", false, this.options.provider, undefined, "MALFORMED_RESPONSE");
        let payload: unknown = {};
        try { payload = raw ? JSON.parse(raw) : {}; } catch { throw new ProviderError("PROVIDER_UNAVAILABLE", "Provider returned malformed JSON", false, this.options.provider, undefined, "MALFORMED_RESPONSE"); }
        if (!response.ok) {
          const category = mapStatus(response.status);
          throw new ProviderError("PROVIDER_UNAVAILABLE", "Provider rejected the request", category === "RATE_LIMIT" || category === "UNAVAILABLE", this.options.provider, { httpStatus: response.status }, category);
        }
        this.options.log?.({ requestId: input.requestId, provider: this.options.provider, operation: input.operation, method, status: response.status, attempt, durationMs: Date.now() - started });
        return payload as T;
      } catch (error) {
        lastError = error instanceof ProviderError ? error : controller.signal.aborted ? new ProviderError("PROVIDER_TIMEOUT", "Provider request timed out", true, this.options.provider, undefined, "TIMEOUT") : new ProviderError("PROVIDER_UNAVAILABLE", "Provider is unavailable", true, this.options.provider, undefined, "UNAVAILABLE");
        this.options.log?.({ requestId: input.requestId, provider: this.options.provider, operation: input.operation, method, attempt, durationMs: Date.now() - started, error: redactProviderData({ category: lastError.category, code: lastError.code }) });
        if (!canRetry || !lastError.retryable || attempt === maxAttempts || Date.now() - started >= (this.options.retryBudgetMs ?? 8_000)) throw lastError;
        const delay = Math.min(1_000, 100 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 50);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } finally {
        clearTimeout(timer);
        input.signal?.removeEventListener("abort", onAbort);
      }
    }
    throw lastError!;
  }
}
