import type { BookingService } from "./booking-service.js";
import type { CompensationService } from "./compensation-service.js";

export class ReconciliationService {
  constructor(private readonly bookings: BookingService, private readonly compensation: CompensationService) {}

  async run(limit = 50) {
    const resolved = await this.bookings.reconcile(limit);
    const results = [];
    for (const entry of resolved) {
      if (entry.outcome === "FAILED") results.push({ ...entry, compensation: await this.compensation.compensate(entry.order.id, "RECONCILED_BOOKING_FAILED") });
      else results.push(entry);
    }
    return results;
  }
}
