import "dotenv/config";
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error("DATABASE_URL is required"); process.exit(2); }
const destination = process.env.BACKUP_DIR || "./backups";
mkdirSync(destination, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = join(destination, `kiashi-${stamp}.dump`);
const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", file, databaseUrl], { stdio: "inherit", shell: false });
if (result.error) { console.error("pg_dump is unavailable or failed to start"); process.exit(1); }
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Backup created: ${file}`);
