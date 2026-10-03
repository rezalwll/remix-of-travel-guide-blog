import { config } from "../config.js";
import { getPrismaClient } from "../db/prisma.js";
import { createProviderRegistry } from "../providers/registry.js";
import { PrismaRuntimeRepository } from "../repositories/prisma-runtime.js";
import { PaymentService } from "../services/payment-service.js";
import { PlatformRepository } from "../repositories/platform.js";
import { randomUUID } from "node:crypto";

const prisma = getPrismaClient();
const repository = new PrismaRuntimeRepository(prisma);
const platform = new PlatformRepository(prisma);
const limitArgument = process.argv.find((value) => /^\d+$/.test(value));
const limit = Math.min(Number(limitArgument ?? 50), 100);
try {
  await repository.connect();
  const requestId = randomUUID();
  await platform.recordSystemAudit({ action: "reconciliation.payment.triggered", resourceType: "PaymentIntent", requestId, metadata: { dryRun: process.argv.includes("--dry-run"), limit, source: "operator-cli" } });
  if (process.argv.includes("--dry-run")) {
    const unresolved = await repository.listUnresolvedPaymentIntents(limit);
    process.stdout.write(`${JSON.stringify({ dryRun: true, inspected: unresolved.length, references: unresolved.map((entry) => entry.externalReference) })}\n`);
  } else {
    const results = await new PaymentService(createProviderRegistry(config).payment, repository).reconcile(limit);
    process.stdout.write(`${JSON.stringify({ dryRun: false, inspected: results.length, outcomes: results.map((entry) => entry.outcome) })}\n`);
  }
} finally { await repository.disconnect(); }
