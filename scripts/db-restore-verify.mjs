import "dotenv/config";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const file = process.env.BACKUP_FILE;
const adminUrl = process.env.RESTORE_ADMIN_DATABASE_URL;
const keep = process.env.RESTORE_VERIFY_KEEP === "true";
if (!file || !adminUrl) { console.error("BACKUP_FILE and RESTORE_ADMIN_DATABASE_URL are required"); process.exit(2); }
if (!existsSync(file)) { console.error("BACKUP_FILE does not exist"); process.exit(2); }

let parsed;
try { parsed = new URL(adminUrl); } catch { console.error("RESTORE_ADMIN_DATABASE_URL is invalid"); process.exit(2); }
if (!["postgresql:", "postgres:"].includes(parsed.protocol)) { console.error("RESTORE_ADMIN_DATABASE_URL must be PostgreSQL"); process.exit(2); }
if (process.env.DATABASE_URL && adminUrl === process.env.DATABASE_URL) { console.error("Refusing to use DATABASE_URL as the restore administration connection"); process.exit(2); }

const databaseName = `kiashi_restore_${Date.now()}_${process.pid}`;
const target = new URL(adminUrl);
target.pathname = `/${databaseName}`;
target.searchParams.delete("schema");
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false, ...options });
  if (result.error || result.status !== 0) throw new Error(`${command} failed`);
  return result;
};

let created = false;
const startedAt = Date.now();
try {
  run("pg_restore", ["--list", file]);
  run("psql", [adminUrl, "-v", "ON_ERROR_STOP=1", "-c", `CREATE DATABASE \"${databaseName}\"`]);
  created = true;
  run("pg_restore", ["--exit-on-error", "--no-owner", "--dbname", target.toString(), file]);
  const integritySql = `SELECT json_build_object(
    'tables', (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'),
    'orders', (SELECT count(*) FROM "Order"),
    'walletEntries', (SELECT count(*) FROM "WalletTransaction"),
    'sampleOrder', (SELECT "orderNumber" FROM "Order" ORDER BY "createdAt" LIMIT 1),
    'walletMismatches', (SELECT count(*) FROM "Wallet" w WHERE w.balance <> COALESCE((SELECT wt."balanceAfter" FROM "WalletTransaction" wt WHERE wt."walletId"=w.id ORDER BY wt."createdAt" DESC, wt.id DESC LIMIT 1), w.balance))
  );`;
  const check = run("psql", [target.toString(), "-v", "ON_ERROR_STOP=1", "-tAc", integritySql], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  const result = JSON.parse(check.stdout?.trim() || "{}");
  if (result.tables < 1 || result.orders < 1 || result.walletEntries < 1 || !result.sampleOrder || result.walletMismatches !== 0) throw new Error("restored data integrity verification failed");
  console.log(`Restore verified in isolated database (${result.tables} tables, ${result.orders} orders, ${result.walletEntries} wallet entries, ${Date.now() - startedAt} ms).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Restore verification failed");
  process.exitCode = 1;
} finally {
  if (created && !keep) {
    try { run("psql", [adminUrl, "-v", "ON_ERROR_STOP=1", "-c", `DROP DATABASE IF EXISTS \"${databaseName}\" WITH (FORCE)`]); console.log("Disposable restore database removed."); }
    catch { console.error("WARNING: disposable restore database cleanup failed"); process.exitCode = 1; }
  } else if (created) {
    console.log(`Disposable restore database retained by request: ${databaseName}`);
  }
}
