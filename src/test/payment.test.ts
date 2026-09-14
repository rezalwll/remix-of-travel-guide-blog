import { describe, expect, it } from 'vitest';
import { calculateInstallmentPlans } from '@/services/payment';
import { validateCoupon } from '@/services/checkout';

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
});
