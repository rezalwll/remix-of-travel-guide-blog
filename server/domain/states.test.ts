import { describe, expect, it } from 'vitest';
import { assertTransition } from './states.js';

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
});
