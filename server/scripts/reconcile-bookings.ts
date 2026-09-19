import { config } from "../config.js";
import { getPrismaClient } from "../db/prisma.js";
import { createProviderRegistry } from "../providers/registry.js";
import { PrismaRuntimeRepository } from "../repositories/prisma-runtime.js";
import { BookingService } from "../services/booking-service.js";
import { CompensationService } from "../services/compensation-service.js";
import { ReconciliationService } from "../services/reconciliation-service.js";

const prisma = getPrismaClient();
const repository = new PrismaRuntimeRepository(prisma);
const providers = createProviderRegistry(config);
const reconciliation = new ReconciliationService(new BookingService(providers, repository), new CompensationService(providers.payment, repository));

try {
  await repository.connect();
  const limitArgument = process.argv.find((value) => /^\d+$/.test(value));
  const limit = Math.min(Number(limitArgument ?? 50), 100);
  if (process.argv.includes("--dry-run")) {
    const unresolved = await repository.listUnresolvedBookings(limit);
    process.stdout.write(`${JSON.stringify({ dryRun: true, inspected: unresolved.length, orders: unresolved.map((entry) => entry.id) })}\n`);
  } else {
    const result = await reconciliation.run(limit);
    process.stdout.write(`${JSON.stringify({ dryRun: false, inspected: result.length, outcomes: result.map((entry) => entry.outcome) })}\n`);
  }
} finally {
  await repository.disconnect();
}
