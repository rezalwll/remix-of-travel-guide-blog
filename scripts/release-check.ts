import "dotenv/config";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { config } from "../server/config.js";
import { disconnectPrisma, getPrismaClient } from "../server/db/prisma.js";
import { createProviderRegistry } from "../server/providers/registry.js";

const failures: string[] = [];
const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
const npmMajor = Number.parseInt(process.env.npm_config_user_agent?.match(/npm\/(\d+)/)?.[1] ?? "0", 10);
if (nodeMajor !== 20) failures.push(`Node 20 is required for release builds (current: ${process.versions.node})`);
if (npmMajor && npmMajor !== 10) failures.push(`npm 10 is required for release builds (current major: ${npmMajor})`);
if (!existsSync("dist") || !existsSync("dist-server")) failures.push("production web/API artifacts are missing; run build:web and build:api");
if (!existsSync("prisma/migrations")) failures.push("prisma migrations directory is missing");
if (config.NODE_ENV === "production") {
  if (!process.env.DATABASE_URL) failures.push("DATABASE_URL must be explicitly set in production");
  if (!process.env.WEB_ORIGIN?.startsWith("https://")) failures.push("WEB_ORIGIN must use HTTPS");
  if (!process.env.API_PUBLIC_URL?.startsWith("https://")) failures.push("API_PUBLIC_URL must use HTTPS");
  if (config.PAYMENT_PROVIDER === "mock" && !config.MOCK_PAYMENT_SECRET) failures.push("MOCK_PAYMENT_SECRET is missing");
  if (process.env.ENABLE_DEMO_SEED === "true") failures.push("demo seed must not be enabled in production");
  if (process.env.VITE_API_URL && !process.env.VITE_API_URL.startsWith("https://")) failures.push("VITE_API_URL must use HTTPS in production");
}
if (config.RATE_LIMIT_STORE !== "memory") failures.push("unsupported rate limit store");
try { createProviderRegistry(config); } catch (error) { failures.push(error instanceof Error ? error.message : "provider configuration is invalid"); }
if (process.env.RELEASE_CHECK_DATABASE === "true") {
  try { await getPrismaClient().$queryRaw`SELECT 1`; } catch { failures.push("database readiness check failed"); }
  finally { await disconnectPrisma(); }
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const migration = spawnSync(npx, ["prisma", "migrate", "status"], { stdio: "inherit", shell: false });
  if (migration.error || migration.status !== 0) failures.push("database migration status check failed");
}
if (failures.length) { console.error(`Release check failed:\n- ${failures.join("\n- ")}`); process.exit(1); }
console.log(`Release check passed (${config.NODE_ENV}, ${config.APP_VERSION}, ${config.GIT_SHA})`);
