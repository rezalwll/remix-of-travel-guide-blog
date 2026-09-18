import { ProviderError, type ProviderOperation } from "./types.js";

export type ProviderLog = (entry: { requestId: string; provider: string; operation: ProviderOperation; durationMs: number; status: string }) => void;

/** Only operational metadata is logged; request/response bodies and secrets stay out of logs. */
export class ProviderExecutor {
  constructor(private readonly timeoutMs = 5_000, private readonly log: ProviderLog = () => {}) {}

  async run<T>(requestId: string, provider: string, operation: ProviderOperation, task: () => Promise<T>): Promise<T> {
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timedOut = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new ProviderError("PROVIDER_TIMEOUT", "Provider request timed out", true, provider)), this.timeoutMs);
      });
      const result = await Promise.race([task(), timedOut]);
      this.log({ requestId, provider, operation, durationMs: Date.now() - started, status: "ok" });
      return result;
    } catch (error) {
      const mapped = error instanceof ProviderError ? error : new ProviderError("PROVIDER_UNAVAILABLE", "Provider is unavailable", true, provider);
      this.log({ requestId, provider, operation, durationMs: Date.now() - started, status: mapped.code });
      throw mapped;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
