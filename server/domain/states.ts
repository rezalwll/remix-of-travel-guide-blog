import { DomainError } from "./errors.js";

export const CHECKOUT_STATES = ["ready_for_payment", "payment_pending", "completed", "expired"] as const;
export const PAYMENT_STATES = ["pending", "succeeded", "failed", "cancelled", "refunded"] as const;
export const PAYMENT_INTENT_STATES = ["created", "pending", "succeeded", "failed", "cancelled", "refunded"] as const;
export const ORDER_BOOKING_STATES = ["paid_booking_pending", "confirmed", "reservation_failed", "compensation_pending", "refunded", "manual_review_required"] as const;
export const BOOKING_ATTEMPT_STATES = ["SELECTED", "PRICE_VALIDATED", "RESERVED", "CONFIRMED", "FAILED", "UNKNOWN"] as const;
export const REFUND_STATES = ["requested", "processing", "completed", "failed"] as const;

export type CheckoutState = typeof CHECKOUT_STATES[number];
export type PaymentState = typeof PAYMENT_STATES[number];
export type PaymentIntentState = typeof PAYMENT_INTENT_STATES[number];
export type OrderBookingState = typeof ORDER_BOOKING_STATES[number];
export type BookingAttemptState = typeof BOOKING_ATTEMPT_STATES[number];
export type RefundState = typeof REFUND_STATES[number];

const transitions = {
  checkout: {
    ready_for_payment: ["payment_pending", "expired"],
    payment_pending: ["completed", "ready_for_payment", "expired"],
    completed: [],
    expired: [],
  },
  payment: {
    pending: ["succeeded", "failed", "cancelled"],
    succeeded: ["refunded"],
    failed: [],
    cancelled: [],
    refunded: [],
  },
  paymentIntent: {
    created: ["pending", "succeeded", "failed", "cancelled"],
    pending: ["succeeded", "failed", "cancelled"],
    succeeded: ["refunded"],
    failed: [],
    cancelled: [],
    refunded: [],
  },
  order: {
    paid_booking_pending: ["confirmed", "reservation_failed", "manual_review_required"],
    confirmed: ["compensation_pending"],
    reservation_failed: ["compensation_pending"],
    compensation_pending: ["refunded", "manual_review_required"],
    refunded: [],
    manual_review_required: ["confirmed", "reservation_failed", "compensation_pending"],
  },
  booking: {
    SELECTED: ["PRICE_VALIDATED", "FAILED", "UNKNOWN"],
    PRICE_VALIDATED: ["RESERVED", "FAILED", "UNKNOWN"],
    RESERVED: ["CONFIRMED", "FAILED", "UNKNOWN"],
    CONFIRMED: [],
    FAILED: [],
    UNKNOWN: ["CONFIRMED", "FAILED", "UNKNOWN"],
  },
  refund: {
    requested: ["processing", "failed"],
    processing: ["completed", "failed"],
    completed: [],
    failed: ["processing"],
  },
} as const;

export function assertTransition<T extends keyof typeof transitions>(machine: T, from: keyof typeof transitions[T] & string, to: string) {
  const allowed = transitions[machine][from] as readonly string[];
  if (from !== to && !allowed?.includes(to)) throw new DomainError("INVALID_STATE_TRANSITION", `Invalid ${machine} transition: ${from} -> ${to}`, 409);
}
