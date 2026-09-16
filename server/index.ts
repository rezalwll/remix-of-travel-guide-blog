import { buildApp } from "./app.js";
import { config } from "./config.js";
import { disconnectPrisma, getPrismaClient } from "./db/prisma.js";

await getPrismaClient().$connect();
const app = await buildApp();
app.addHook("onClose", async () => { await disconnectPrisma(); });
const shutdown = async () => { await app.close(); process.exit(0); };
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
await app.listen({ port: config.API_PORT, host: "0.0.0.0" });
