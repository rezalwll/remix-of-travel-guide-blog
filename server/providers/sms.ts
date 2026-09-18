import { randomUUID } from "node:crypto";
import { ProviderError } from "./types.js";

export type SmsStatus = "queued" | "sent" | "failed" | "expired";
export type SmsSendInput = { mobile: string; template: string; variables?: Record<string, string>; idempotencyKey?: string };
export type SmsSendResult = { status: SmsStatus; providerReference?: string; errorCode?: string };

export interface SmsProvider {
  readonly name: string;
  send(input: SmsSendInput): Promise<SmsSendResult>;
  checkStatus(providerReference: string): Promise<SmsStatus>;
}

export type DevelopmentSmsProviderOptions = { fail?: boolean; latencyMs?: number };

/** Deterministic SMS adapter used until a real vendor is configured. */
export class DevelopmentSmsProvider implements SmsProvider {
  readonly name = "development";
  private readonly deliveries = new Map<string, SmsStatus>();

  constructor(private readonly options: DevelopmentSmsProviderOptions = {}) {}

  async send(input: SmsSendInput): Promise<SmsSendResult> {
    if (this.options.latencyMs) await new Promise((resolve) => setTimeout(resolve, this.options.latencyMs));
    if (this.options.fail) {
      const reference = `DEV-SMS-${randomUUID()}`;
      this.deliveries.set(reference, "failed");
      return { status: "failed", providerReference: reference, errorCode: "DEVELOPMENT_FAILURE" };
    }
    const reference = `DEV-SMS-${randomUUID()}`;
    this.deliveries.set(reference, "sent");
    void input;
    return { status: "sent", providerReference: reference };
  }

  async checkStatus(providerReference: string): Promise<SmsStatus> {
    return this.deliveries.get(providerReference) ?? "expired";
  }
}

export async function sendSmsWithRetry(provider: SmsProvider, input: SmsSendInput, attempts = 2): Promise<SmsSendResult> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const result = await provider.send(input);
      if (result.status !== "failed" || attempt === attempts - 1) return result;
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1) break;
    }
  }
  throw new ProviderError("PROVIDER_UNAVAILABLE", `SMS provider is unavailable${lastError ? ": retry exhausted" : ""}`, true, provider.name);
}
