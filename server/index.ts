import { buildApp } from "./app.js";
import { config } from "./config.js";
import { disconnectPrisma } from "./db/prisma.js";

const app = await buildApp();
app.addHook("onClose", async () => { await disconnectPrisma(); });
let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, "graceful shutdown started");
  const timeout = setTimeout(() => { app.log.error("graceful shutdown timed out"); process.exit(1); }, 10_000);
  timeout.unref();
  try { await app.close(); clearTimeout(timeout); process.exit(0); } catch (error) { clearTimeout(timeout); app.log.error({ errorName: error instanceof Error ? error.name : "unknown" }, "graceful shutdown failed"); process.exit(1); }
};
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
await app.listen({ port: config.API_PORT, host: "0.0.0.0" });
