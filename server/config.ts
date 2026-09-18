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
});

export const config = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  API_PORT: process.env.API_PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  WEB_ORIGIN: process.env.WEB_ORIGIN,
  API_PUBLIC_URL: process.env.API_PUBLIC_URL,
  SESSION_TTL_HOURS: process.env.SESSION_TTL_HOURS,
  PROVIDER_TIMEOUT_MS: process.env.PROVIDER_TIMEOUT_MS,
  MOCK_PAYMENT_SECRET: process.env.MOCK_PAYMENT_SECRET,
  SMS_PROVIDER: process.env.SMS_PROVIDER,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
  FLIGHT_PROVIDER: process.env.FLIGHT_PROVIDER,
  HOTEL_PROVIDER: process.env.HOTEL_PROVIDER,
  TRAIN_PROVIDER: process.env.TRAIN_PROVIDER,
  BUS_PROVIDER: process.env.BUS_PROVIDER,
  INSURANCE_PROVIDER: process.env.INSURANCE_PROVIDER,
  CIP_PROVIDER: process.env.CIP_PROVIDER,
  TRANSFER_PROVIDER: process.env.TRANSFER_PROVIDER,
  VISA_PROVIDER: process.env.VISA_PROVIDER,
});
