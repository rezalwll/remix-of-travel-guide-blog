import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ProviderHttpClient } from "./http-client.js";
import type { SmsProvider, SmsSendInput, SmsSendResult, SmsStatus } from "./sms.js";
import { ProviderError } from "./types.js";

const responseSchema = z.object({
  Value: z.union([z.string(), z.number()]).transform(String),
  RetStatus: z.coerce.number().int(),
  StrRetStatus: z.string().optional(),
});

const otpTemplates = new Set(["OTP_LOGIN", "login_otp", "otp"]);

export type MelipayamakSmsProviderOptions = {
  baseUrl: string;
  username: string;
  apiKey: string;
  otpBodyId: string;
  timeoutMs?: number;
  maxResponseBytes?: number;
  fetch?: typeof globalThis.fetch;
  log?: (entry: Record<string, unknown>) => void;
};

export class MelipayamakSmsProvider implements SmsProvider {
  readonly name = "melipayamak";
  // BaseServiceNumber has no idempotency-key contract. Automatic retries could send duplicate OTPs.
  readonly supportsIdempotency = false;
  private readonly client: ProviderHttpClient;

  constructor(private readonly options: MelipayamakSmsProviderOptions) {
    if (!options.username.trim()) throw new ProviderError("INVALID_REQUEST", "Melipayamak username is required", false, this.name, undefined, "CONFIGURATION");
    if (!/^\d+$/.test(options.otpBodyId)) throw new ProviderError("INVALID_REQUEST", "Melipayamak OTP BodyId must be numeric", false, this.name, undefined, "CONFIGURATION");
    this.client = new ProviderHttpClient({
      provider: this.name,
      baseUrl: options.baseUrl,
      timeoutMs: options.timeoutMs,
      maxResponseBytes: options.maxResponseBytes,
      maxAttempts: 1,
      fetch: options.fetch,
      log: options.log,
    });
  }

  async send(input: SmsSendInput): Promise<SmsSendResult> {
    if (!/^09\d{9}$/.test(input.mobile)) throw new ProviderError("INVALID_REQUEST", "SMS recipient is invalid", false, this.name);
    if (!otpTemplates.has(input.template)) throw new ProviderError("INVALID_REQUEST", "Melipayamak template is not configured", false, this.name, undefined, "CONFIGURATION");
    const code = input.variables?.code;
    if (!code || !/^\d{5}$/.test(code)) throw new ProviderError("INVALID_REQUEST", "OTP code is invalid", false, this.name);

    const payload = await this.client.request<unknown>({
      path: "BaseServiceNumber",
      method: "POST",
      requestId: input.requestId ?? input.idempotencyKey ?? randomUUID(),
      operation: "send",
      retrySafety: "unsafe",
      bodyEncoding: "form",
      body: {
        username: this.options.username,
        password: this.options.apiKey,
        text: code,
        to: input.mobile,
        bodyId: this.options.otpBodyId,
      },
    });
    const response = this.parse(payload);
    if (response.RetStatus !== 1 || !/^\d+$/.test(response.Value) || response.Value === "0") {
      const providerValue = /^-?\d+$/.test(response.Value) ? response.Value : "unknown";
      throw new ProviderError("PROVIDER_UNAVAILABLE", "Melipayamak rejected the SMS request", false, this.name, { providerCode: String(response.RetStatus), providerValue }, "REJECTED");
    }
    return { status: "queued", providerReference: response.Value };
  }

  async checkStatus(providerReference: string): Promise<SmsStatus> {
    if (!/^\d+$/.test(providerReference)) throw new ProviderError("INVALID_REQUEST", "SMS provider reference is invalid", false, this.name);
    const payload = await this.client.request<unknown>({
      path: "GetDeliveries2",
      method: "POST",
      requestId: randomUUID(),
      operation: "checkStatus",
      retrySafety: "safe",
      bodyEncoding: "form",
      body: {
        UserName: this.options.username,
        PassWord: this.options.apiKey,
        recID: providerReference,
      },
    });
    const response = this.parse(payload);
    if (response.RetStatus !== 1) throw new ProviderError("PROVIDER_UNAVAILABLE", "Melipayamak delivery lookup failed", true, this.name, { providerCode: String(response.RetStatus) }, "UNAVAILABLE");
    if (response.Value === "1") return "sent";
    if (["2", "5", "16", "35"].includes(response.Value)) return "failed";
    return "queued";
  }

  private parse(payload: unknown) {
    const parsed = responseSchema.safeParse(payload);
    if (!parsed.success) throw new ProviderError("PROVIDER_UNAVAILABLE", "Melipayamak returned a malformed response", false, this.name, undefined, "MALFORMED_RESPONSE");
    return parsed.data;
  }
}
