import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_URL: z.string().default("postgresql://kiashi:kiashi@localhost:5432/kiashi"),
  WEB_ORIGIN: z.string().default("http://localhost:8080"),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(168),
});

export const config = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  API_PORT: process.env.API_PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  WEB_ORIGIN: process.env.WEB_ORIGIN,
  SESSION_TTL_HOURS: process.env.SESSION_TTL_HOURS,
});
