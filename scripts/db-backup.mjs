import "dotenv/config";
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error("DATABASE_URL is required"); process.exit(2); }
let pgDumpUrl;
try {
  pgDumpUrl = new URL(databaseUrl);
} catch {
  console.error("DATABASE_URL is invalid");
  process.exit(2);
}
if (!["postgresql:", "postgres:"].includes(pgDumpUrl.protocol)) {
  console.error("DATABASE_URL must be PostgreSQL");
  process.exit(2);
}
// `schema` is a Prisma connection option, not a libpq option understood by pg_dump.
pgDumpUrl.searchParams.delete("schema");
const destination = process.env.BACKUP_DIR || "./backups";
mkdirSync(destination, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = join(destination, `kiashi-${stamp}.dump`);
const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", file, pgDumpUrl.toString()], { stdio: "inherit", shell: false });
if (result.error) { console.error("pg_dump is unavailable or failed to start"); process.exit(1); }
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Backup created: ${file}`);
