import { describe, expect, it, vi } from 'vitest';
import { MockPaymentGateway } from '../providers/payment.js';
import { ProviderError } from '../providers/types.js';
import { CompensationService, type CompensationRepository } from './compensation-service.js';

const setup = (onlineAmount = 600, walletAmount = 400) => {
  let completed = false;
  let completionCount = 0;
  const repository: CompensationRepository = {
    beginCompensation: async () => ({
      order: { id: 'order-1', bookingStatus: completed ? 'refunded' : 'reservation_failed' },
      payment: { provider: 'mock', method: 'combined', onlineAmount, walletAmount },
      refund: { id: 'refund-1', status: completed ? 'completed' : 'processing' },
      alreadyCompleted: completed,
      externalReference: 'MOCK-PAY-RECOVERABLE',
    }),
    completeCompensation: async () => { completed = true; completionCount += 1; return { id: 'order-1', bookingStatus: 'refunded' }; },
    failCompensation: async () => undefined,
  };
  return { repository, get completionCount() { return completionCount; } };
};

describe('CompensationService', () => {
  it('reverses the online component once and converges on retry', async () => {
    const gateway = new MockPaymentGateway();
    const refund = vi.spyOn(gateway, 'refundPayment');
    const state = setup();
    const service = new CompensationService(gateway, state.repository);
    expect(await service.compensate('order-1')).toMatchObject({ compensated: true, duplicate: false, order: { bookingStatus: 'refunded' } });
    expect(await service.compensate('order-1')).toMatchObject({ compensated: true, duplicate: true });
    expect(refund).toHaveBeenCalledTimes(1);
    expect(refund).toHaveBeenCalledWith(expect.objectContaining({ amount: 600, idempotencyKey: 'compensation:refund-1' }));
    expect(state.completionCount).toBe(1);
  });

  it('does not call the gateway for wallet-only compensation', async () => {
    const gateway = new MockPaymentGateway();
    const refund = vi.spyOn(gateway, 'refundPayment');
    const state = setup(0, 1000);
    const result = await new CompensationService(gateway, state.repository).compensate('order-1');
    expect(result.compensated).toBe(true);
    expect(refund).not.toHaveBeenCalled();
  });

  it('leaves a provider refund failure for manual recovery', async () => {
    const gateway = new MockPaymentGateway();
    gateway.refundPayment = async () => { throw new ProviderError('PROVIDER_UNAVAILABLE', 'down', true, 'mock'); };
    const state = setup();
    const failed = vi.spyOn(state.repository, 'failCompensation');
    const result = await new CompensationService(gateway, state.repository).compensate('order-1');
    expect(result).toMatchObject({ compensated: false, pending: true, error: 'PROVIDER_UNAVAILABLE' });
    expect(failed).toHaveBeenCalledWith('refund-1', true);
  });
});
