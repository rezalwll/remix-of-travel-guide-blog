import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_URL: z.string().default("postgresql://kiashi:kiashi@localhost:5432/kiashi"),
  WEB_ORIGIN: z.string().default("http://localhost:8080"),
  API_PUBLIC_URL: z.string().url().default("http://localhost:8787"),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(168),
  PROVIDER_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  PROVIDER_MAX_RESPONSE_BYTES: z.coerce.number().int().positive().default(262144),
  TRUST_PROXY: z.string().default("false").transform((value, ctx) => {
    if (value === "false") return false as const;
    const trusted = value.split(",").map((entry) => entry.trim()).filter(Boolean);
    if (!trusted.length || trusted.includes("true")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "TRUST_PROXY must be false or a comma-separated IP/CIDR allowlist" });
      return z.NEVER;
    }
    return trusted;
  }),
  MOCK_PAYMENT_SECRET: z.string().min(32).optional(),
  SMS_PROVIDER: z.string().default("development"),
  PAYMENT_PROVIDER: z.string().default("mock"),
  FLIGHT_PROVIDER: z.string().default("mock"),
  HOTEL_PROVIDER: z.string().default("mock"),
  TRAIN_PROVIDER: z.string().default("mock"),
  BUS_PROVIDER: z.string().default("mock"),
  INSURANCE_PROVIDER: z.string().default("mock"),
  CIP_PROVIDER: z.string().default("mock"),
  TRANSFER_PROVIDER: z.string().default("mock"),
  VISA_PROVIDER: z.string().default("mock"),
  SMS_PROVIDER_MODE: z.enum(["disabled", "sandbox", "real"]).default("sandbox"),
  SMS_PROVIDER_BASE_URL: z.string().url().optional(),
  SMS_PROVIDER_API_KEY: z.string().min(8).optional(),
  SMS_PROVIDER_SENDER: z.string().min(2).optional(),
  SMS_PROVIDER_OTP_TEMPLATE: z.string().min(2).optional(),
  PAYMENT_PROVIDER_MODE: z.enum(["disabled", "sandbox", "real"]).default("sandbox"),
  PAYMENT_PROVIDER_BASE_URL: z.string().url().optional(),
  PAYMENT_PROVIDER_MERCHANT_ID: z.string().min(2).optional(),
  PAYMENT_PROVIDER_SECRET: z.string().min(16).optional(),
  TRAVEL_PROVIDER_MODE: z.enum(["disabled", "sandbox", "real"]).default("sandbox"),
  TRAVEL_PROVIDER_BASE_URL: z.string().url().optional(),
  TRAVEL_PROVIDER_API_KEY: z.string().min(8).optional(),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
  APP_VERSION: z.string().min(1).max(120).default("0.0.0-dev"),
  GIT_SHA: z.string().max(80).default("local"),
  BUILD_TIME: z.string().max(80).default("unknown"),
  RATE_LIMIT_STORE: z.enum(["memory"]).default("memory"),
  E2E_OTP_CODE: z.string().regex(/^\d{5}$/).optional(),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== "production") return;
  if (!value.WEB_ORIGIN.startsWith("https://")) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["WEB_ORIGIN"], message: "WEB_ORIGIN must use HTTPS in production" });
  if (!value.API_PUBLIC_URL.startsWith("https://")) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["API_PUBLIC_URL"], message: "API_PUBLIC_URL must use HTTPS in production" });
  if (value.TRUST_PROXY === false) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["TRUST_PROXY"], message: "TRUST_PROXY must list the production proxy IP/CIDR" });
  if (value.PAYMENT_PROVIDER === "mock" && (!value.MOCK_PAYMENT_SECRET || value.MOCK_PAYMENT_SECRET.length < 32)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["MOCK_PAYMENT_SECRET"], message: "MOCK_PAYMENT_SECRET (32+ chars) is required for production mock callbacks" });
  if (value.PAYMENT_PROVIDER_MODE === "real" && value.PAYMENT_PROVIDER === "mock") ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["PAYMENT_PROVIDER_MODE"], message: "real payment mode cannot use the mock provider" });
  if (value.APP_VERSION === "0.0.0-dev") ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["APP_VERSION"], message: "APP_VERSION must identify the release" });
  if (value.GIT_SHA === "local") ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["GIT_SHA"], message: "GIT_SHA must identify the deployed revision" });
  if (value.BUILD_TIME === "unknown" || Number.isNaN(Date.parse(value.BUILD_TIME))) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["BUILD_TIME"], message: "BUILD_TIME must be an ISO timestamp" });
  if (value.E2E_OTP_CODE && !["127.0.0.1", "localhost", "::1"].includes(new URL(value.WEB_ORIGIN).hostname)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["E2E_OTP_CODE"], message: "E2E_OTP_CODE is restricted to loopback certification environments" });
});

export function parseConfig(source: NodeJS.ProcessEnv = process.env) {
  const parsed = envSchema.parse({
    NODE_ENV: source.NODE_ENV, API_PORT: source.API_PORT, DATABASE_URL: source.DATABASE_URL, WEB_ORIGIN: source.WEB_ORIGIN, API_PUBLIC_URL: source.API_PUBLIC_URL,
    SESSION_TTL_HOURS: source.SESSION_TTL_HOURS, PROVIDER_TIMEOUT_MS: source.PROVIDER_TIMEOUT_MS, PROVIDER_MAX_RESPONSE_BYTES: source.PROVIDER_MAX_RESPONSE_BYTES, TRUST_PROXY: source.TRUST_PROXY, MOCK_PAYMENT_SECRET: source.MOCK_PAYMENT_SECRET,
    SMS_PROVIDER: source.SMS_PROVIDER, PAYMENT_PROVIDER: source.PAYMENT_PROVIDER, FLIGHT_PROVIDER: source.FLIGHT_PROVIDER, HOTEL_PROVIDER: source.HOTEL_PROVIDER, TRAIN_PROVIDER: source.TRAIN_PROVIDER, BUS_PROVIDER: source.BUS_PROVIDER, INSURANCE_PROVIDER: source.INSURANCE_PROVIDER, CIP_PROVIDER: source.CIP_PROVIDER, TRANSFER_PROVIDER: source.TRANSFER_PROVIDER, VISA_PROVIDER: source.VISA_PROVIDER,
    SMS_PROVIDER_MODE: source.SMS_PROVIDER_MODE, SMS_PROVIDER_BASE_URL: source.SMS_PROVIDER_BASE_URL, SMS_PROVIDER_API_KEY: source.SMS_PROVIDER_API_KEY, SMS_PROVIDER_SENDER: source.SMS_PROVIDER_SENDER, SMS_PROVIDER_OTP_TEMPLATE: source.SMS_PROVIDER_OTP_TEMPLATE,
    PAYMENT_PROVIDER_MODE: source.PAYMENT_PROVIDER_MODE, PAYMENT_PROVIDER_BASE_URL: source.PAYMENT_PROVIDER_BASE_URL, PAYMENT_PROVIDER_MERCHANT_ID: source.PAYMENT_PROVIDER_MERCHANT_ID, PAYMENT_PROVIDER_SECRET: source.PAYMENT_PROVIDER_SECRET,
    TRAVEL_PROVIDER_MODE: source.TRAVEL_PROVIDER_MODE, TRAVEL_PROVIDER_BASE_URL: source.TRAVEL_PROVIDER_BASE_URL, TRAVEL_PROVIDER_API_KEY: source.TRAVEL_PROVIDER_API_KEY,
    LOG_LEVEL: source.LOG_LEVEL, APP_VERSION: source.APP_VERSION, GIT_SHA: source.GIT_SHA, BUILD_TIME: source.BUILD_TIME, RATE_LIMIT_STORE: source.RATE_LIMIT_STORE, E2E_OTP_CODE: source.E2E_OTP_CODE,
  });
  if (parsed.NODE_ENV === "production") {
    for (const name of ["DATABASE_URL", "WEB_ORIGIN", "API_PUBLIC_URL", "TRUST_PROXY", "APP_VERSION", "GIT_SHA", "BUILD_TIME"] as const) if (!source[name]) throw new Error(`${name} must be explicitly configured in production`);
  }
  return parsed;
}

export const config = parseConfig();
