import { ProviderError, type ProviderOperation } from "./types.js";

export type ProviderLog = (entry: { requestId: string; provider: string; operation: ProviderOperation; durationMs: number; status: string; category?: string; retryable?: boolean }) => void;

/** Only operational metadata is logged; request/response bodies and secrets stay out of logs. */
export class ProviderExecutor {
  constructor(private readonly timeoutMs = 5_000, private readonly log: ProviderLog = () => {}) {}

  async run<T>(requestId: string, provider: string, operation: ProviderOperation, task: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("provider timeout")), this.timeoutMs);
    try {
      const timedOut = new Promise<never>((_resolve, reject) => {
        controller.signal.addEventListener("abort", () => reject(new ProviderError("PROVIDER_TIMEOUT", "Provider request timed out", true, provider, undefined, "TIMEOUT")), { once: true });
      });
      const result = await Promise.race([task(controller.signal), timedOut]);
      this.log({ requestId, provider, operation, durationMs: Date.now() - started, status: "ok" });
      return result;
    } catch (error) {
      const mapped = error instanceof ProviderError ? error : new ProviderError("PROVIDER_UNAVAILABLE", "Provider is unavailable", true, provider, undefined, "UNAVAILABLE");
      this.log({ requestId, provider, operation, durationMs: Date.now() - started, status: mapped.code, category: mapped.category, retryable: mapped.retryable });
      throw mapped;
    } finally {
      clearTimeout(timer);
    }
  }
}
