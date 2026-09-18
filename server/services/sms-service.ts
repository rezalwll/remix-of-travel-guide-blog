import { sendSmsWithRetry, type SmsProvider, type SmsSendResult } from "../providers/sms.js";
import { ProviderExecutor } from "../providers/execute.js";
import { ProviderError } from "../providers/types.js";

export type SmsAttemptRecorder = {
  createSmsDeliveryAttempt(input: { mobile: string; template: string; provider: string; status: string; providerReference?: string; errorCode?: string }): Promise<{ id: string }>;
  updateSmsDeliveryAttempt(id: string, input: { status: string; providerReference?: string; errorCode?: string }): Promise<unknown>;
};

export class SmsService {
  constructor(private readonly provider: SmsProvider, private readonly recorder?: SmsAttemptRecorder, private readonly executor = new ProviderExecutor()) {}

  async send(input: { mobile: string; template: string; variables?: Record<string, string>; idempotencyKey?: string }, requestId = "internal"): Promise<SmsSendResult> {
    const attempt = await this.recorder?.createSmsDeliveryAttempt({ mobile: input.mobile, template: input.template, provider: this.provider.name, status: "queued" });
    try {
      const result = await this.executor.run(requestId, this.provider.name, "send", async () => {
        const delivery = await sendSmsWithRetry(this.provider, input);
        if (delivery.status === "failed") throw new ProviderError("PROVIDER_UNAVAILABLE", "SMS delivery failed", true, this.provider.name);
        return delivery;
      });
      if (attempt) await this.recorder?.updateSmsDeliveryAttempt(attempt.id, { status: result.status, providerReference: result.providerReference, errorCode: result.errorCode });
      return result;
    } catch (error) {
      if (attempt) await this.recorder?.updateSmsDeliveryAttempt(attempt.id, { status: "failed", errorCode: error instanceof ProviderError ? error.code : "PROVIDER_UNAVAILABLE" });
      throw error;
    }
  }

  checkStatus(providerReference: string, requestId = "internal") {
    return this.executor.run(requestId, this.provider.name, "checkStatus", () => this.provider.checkStatus(providerReference));
  }
}
