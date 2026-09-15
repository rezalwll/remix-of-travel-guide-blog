import { describe, expect, it } from 'vitest';
import { findPublicOrder, maskMobile } from '@/services/orderTracking';

const order = { id: 'order-1', orderNumber: 'KIA-2026-000001', buyer: { mobile: '09120000000' }, payment: { transactionReference: '123456' } } as never;
describe('public order tracking', () => {
  it('finds by order/reference and rejects a mismatched mobile', () => {
    expect(findPublicOrder('KIA-2026-000001', '09120000000', [order])).toEqual({ order });
    expect(findPublicOrder('123456', '09121111111', [order])).toEqual({ error: 'mobile_mismatch' });
  });
  it('masks mobile numbers in public views', () => expect(maskMobile('09120000000')).toBe('0912•••••••'));
});
