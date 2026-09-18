import { sendSmsWithRetry, type SmsProvider, type SmsSendResult } from "../providers/sms.js";

export type SmsAttemptRecorder = {
  createSmsDeliveryAttempt(input: { mobile: string; template: string; provider: string; status: string; providerReference?: string; errorCode?: string }): Promise<{ id: string }>;
  updateSmsDeliveryAttempt(id: string, input: { status: string; providerReference?: string; errorCode?: string }): Promise<unknown>;
};

export class SmsService {
  constructor(private readonly provider: SmsProvider, private readonly recorder?: SmsAttemptRecorder) {}

  async send(input: { mobile: string; template: string; variables?: Record<string, string>; idempotencyKey?: string }): Promise<SmsSendResult> {
    const result = await sendSmsWithRetry(this.provider, input);
    if (!this.recorder) return result;
    const attempt = await this.recorder.createSmsDeliveryAttempt({ mobile: input.mobile, template: input.template, provider: this.provider.name, status: "queued" });
    await this.recorder.updateSmsDeliveryAttempt(attempt.id, { status: result.status, providerReference: result.providerReference, errorCode: result.errorCode });
    return result;
  }
}
