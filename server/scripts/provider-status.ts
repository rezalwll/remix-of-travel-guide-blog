import { config } from "../config.js";
import { createProviderRegistry } from "../providers/registry.js";

const registry = createProviderRegistry(config);
process.stdout.write(`${JSON.stringify({ providers: registry.activations }, null, process.argv.includes("--json") ? 0 : 2)}\n`);
