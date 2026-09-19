import { config } from "../config.js";
import { createProviderRegistry } from "../providers/registry.js";

const statuses = await createProviderRegistry(config).status();
const requiredFailures = statuses.filter((entry) => entry.enabled && !entry.optional && !entry.healthy);
process.stdout.write(`${JSON.stringify({ ok: requiredFailures.length === 0, providers: statuses }, null, process.argv.includes("--json") ? 0 : 2)}\n`);
if (requiredFailures.length) process.exitCode = 1;
