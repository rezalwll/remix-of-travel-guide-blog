import type { PaymentGateway } from "../providers/payment.js";
import { ProviderExecutor } from "../providers/execute.js";
import { ProviderError } from "../providers/types.js";

export type CompensationRepository = {
  beginCompensation(orderId: string, reason: string): Promise<{
    order: { id: string; bookingStatus: string };
    payment: { provider: string; method: string; walletAmount: number; onlineAmount: number };
    refund: { id: string; status: string };
    alreadyCompleted: boolean;
    externalReference?: string;
  }>;
  completeCompensation(refundId: string, providerReference?: string): Promise<unknown>;
  failCompensation(refundId: string, manualReview?: boolean): Promise<unknown>;
};

export class CompensationService {
  constructor(private readonly gateway: PaymentGateway, private readonly repository: CompensationRepository, private readonly executor = new ProviderExecutor()) {}

  async compensate(orderId: string, reason = "SUPPLIER_BOOKING_FAILED", requestId = "compensation") {
    const context = await this.repository.beginCompensation(orderId, reason);
    if (context.alreadyCompleted) return { compensated: true, duplicate: true, order: context.order };
    try {
      let providerReference: string | undefined;
      if (context.payment.onlineAmount > 0) {
        if (!context.externalReference) throw new ProviderError("INVALID_REQUEST", "Payment provider reference is missing", false, context.payment.provider);
        const refunded = await this.executor.run(requestId, this.gateway.name, "refund", () => this.gateway.refundPayment({ externalReference: context.externalReference!, amount: context.payment.onlineAmount, reason, idempotencyKey: `compensation:${context.refund.id}` }));
        providerReference = refunded.providerReference;
      }
      const order = await this.repository.completeCompensation(context.refund.id, providerReference);
      return { compensated: true, duplicate: false, order };
    } catch (error) {
      await this.repository.failCompensation(context.refund.id, true);
      if (error instanceof ProviderError) return { compensated: false, duplicate: false, pending: true, error: error.code };
      throw error;
    }
  }
}
