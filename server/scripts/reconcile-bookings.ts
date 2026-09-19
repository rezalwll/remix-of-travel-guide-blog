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
  const result = await reconciliation.run(Number(process.argv[2] ?? 50));
  process.stdout.write(`${JSON.stringify({ inspected: result.length, outcomes: result.map((entry) => entry.outcome) })}\n`);
} finally {
  await repository.disconnect();
}

