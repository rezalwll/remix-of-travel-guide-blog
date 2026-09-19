import { z } from "zod";
import type { ProviderLifecycle } from "./types.js";

const endpointSchema = z.string().url().transform((value, context) => {
  const url = new URL(value);
  if (url.username || url.password) context.addIssue({ code: z.ZodIssueCode.custom, message: "Provider URLs must not embed credentials" });
  if (!["https:", "http:"].includes(url.protocol)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Provider URL protocol is invalid" });
  return url.toString().replace(/\/$/, "");
});

export type ProviderMode = "disabled" | "sandbox" | "real";
export type ProviderActivation = { key: string; adapter: string; mode: ProviderMode; lifecycle: ProviderLifecycle; enabled: boolean; optional: boolean; reason?: string };

type RuntimeEnv = Record<string, unknown> & { NODE_ENV: string };

export function validateProviderActivation(env: RuntimeEnv): ProviderActivation[] {
  const validateUrl = (value: unknown, label: string) => {
    const parsed = endpointSchema.safeParse(value);
    if (!parsed.success) throw new Error(`${label} is invalid`);
    const url = new URL(parsed.data);
    if (env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error(`${label} must use HTTPS in production`);
  };
  const group = (key: string, adapter: string, mode: ProviderMode, requirements: Array<[string, unknown]>, optional: boolean): ProviderActivation => {
    if (mode === "disabled") return { key, adapter, mode, lifecycle: "DISABLED", enabled: false, optional };
    if (mode === "sandbox") return { key, adapter, mode, lifecycle: "SANDBOX", enabled: true, optional };
    const missing = requirements.filter(([, value]) => typeof value !== "string" || !value).map(([name]) => name);
    if (missing.length) throw new Error(`${key} real mode is missing required configuration: ${missing.join(", ")}`);
    validateUrl(requirements[0][1], requirements[0][0]);
    if (["mock", "development", "disabled"].includes(adapter)) throw new Error(`${key} real mode requires a real adapter, not ${adapter}`);
    throw new Error(`${key} adapter ${adapter} is not available in this build; no mock fallback was applied`);
  };
  const sms = group("sms", String(env.SMS_PROVIDER), env.SMS_PROVIDER_MODE as ProviderMode, [["SMS_PROVIDER_BASE_URL", env.SMS_PROVIDER_BASE_URL], ["SMS_PROVIDER_API_KEY", env.SMS_PROVIDER_API_KEY], ["SMS_PROVIDER_SENDER", env.SMS_PROVIDER_SENDER], ["SMS_PROVIDER_OTP_TEMPLATE", env.SMS_PROVIDER_OTP_TEMPLATE]], false);
  const payment = group("payment", String(env.PAYMENT_PROVIDER), env.PAYMENT_PROVIDER_MODE as ProviderMode, [["PAYMENT_PROVIDER_BASE_URL", env.PAYMENT_PROVIDER_BASE_URL], ["PAYMENT_PROVIDER_MERCHANT_ID", env.PAYMENT_PROVIDER_MERCHANT_ID], ["PAYMENT_PROVIDER_SECRET", env.PAYMENT_PROVIDER_SECRET]], false);
  const travelKeys = ["FLIGHT", "HOTEL", "TRAIN", "BUS", "INSURANCE", "CIP", "TRANSFER", "VISA"] as const;
  return [sms, payment, ...travelKeys.map((name) => group(name.toLowerCase(), String(env[`${name}_PROVIDER`]), env.TRAVEL_PROVIDER_MODE as ProviderMode, [["TRAVEL_PROVIDER_BASE_URL", env.TRAVEL_PROVIDER_BASE_URL], ["TRAVEL_PROVIDER_API_KEY", env.TRAVEL_PROVIDER_API_KEY]], true))];
}
