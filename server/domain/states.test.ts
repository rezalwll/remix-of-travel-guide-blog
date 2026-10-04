import { describe, expect, it } from 'vitest';
import { assertBookingOverride, assertTransition } from './states.js';

describe('domain state machines', () => {
  it('accepts lifecycle progress and rejects impossible transitions', () => {
    expect(() => assertTransition('checkout', 'ready_for_payment', 'payment_pending')).not.toThrow();
    expect(() => assertTransition('payment', 'pending', 'succeeded')).not.toThrow();
    expect(() => assertTransition('paymentIntent', 'created', 'succeeded')).not.toThrow();
    expect(() => assertTransition('order', 'reservation_failed', 'compensation_pending')).not.toThrow();
    expect(() => assertTransition('booking', 'UNKNOWN', 'CONFIRMED')).not.toThrow();
    expect(() => assertTransition('refund', 'processing', 'completed')).not.toThrow();
    expect(() => assertTransition('payment', 'refunded', 'succeeded')).toThrowError(/Invalid payment transition/);
    expect(() => assertTransition('order', 'refunded', 'confirmed')).toThrowError(/Invalid order transition/);
  });
  it('keeps manual booking overrides away from financial refund transitions', () => {
    expect(() => assertBookingOverride('confirmed', 'manual_review_required')).not.toThrow();
    expect(() => assertBookingOverride('confirmed', 'refunded')).toThrowError(/Invalid booking override/);
    expect(() => assertBookingOverride('refunded', 'confirmed')).toThrowError(/Invalid booking override/);
  });
});
