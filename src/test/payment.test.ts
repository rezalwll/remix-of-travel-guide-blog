import { describe, expect, it } from 'vitest';
import { calculateInstallmentPlans, checkoutPayloadFromDraft } from '@/services/payment';
import { validateCoupon } from '@/services/checkout';
import type { BookingDraft } from '@/types/checkout';

describe('mock payment calculations', () => {
  it('creates deterministic installment plans', () => {
    const plans = calculateInstallmentPlans(27000000);
    expect(plans).toHaveLength(2);
    expect(plans[0].upfront + plans[0].monthly * 2).toBe(27000000);
  });

  it('validates demo coupons against minimum order value', () => {
    expect(validateCoupon('TRAVEL500', 1000000)).toBeNull();
    expect(validateCoupon('TRAVEL500', 6000000)?.discount).toBe(500000);
  });

  it('serializes a browser draft into the server checkout contract', () => {
    const draft = { serviceType: 'flight', searchUrl: '/flights/search', searchParams: { from: 'IKA', to: 'IST' }, outbound: { id: 'flight-1' }, inbound: null, buyer: { firstName: 'رضا', lastName: 'احمدی', mobile: '09121234567', email: '' }, passengers: [{ id: 'p1' }], ancillaries: ['baggage'], coupon: { code: 'WELCOME', discount: 300000, message: '' }, termsAccepted: true } as unknown as BookingDraft;
    const payload = checkoutPayloadFromDraft(draft);
    expect(payload).toMatchObject({ serviceType: 'flight', quantity: 1, guestMobile: '09121234567', coupon: 'WELCOME', addOns: [{ code: 'baggage' }] });
    expect(payload.service).toMatchObject({ searchUrl: '/flights/search' });
  });
});
