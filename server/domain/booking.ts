export const BOOKING_STATES = ["SEARCHED", "SELECTED", "PRICE_VALIDATED", "RESERVED", "CONFIRMED", "CANCELLED", "REFUNDED"] as const;
export type BookingState = typeof BOOKING_STATES[number];

const transitions: Record<BookingState, readonly BookingState[]> = {
  SEARCHED: ["SELECTED", "CANCELLED"],
  SELECTED: ["PRICE_VALIDATED", "CANCELLED"],
  PRICE_VALIDATED: ["RESERVED", "CANCELLED"],
  RESERVED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export const canTransitionBooking = (from: BookingState, to: BookingState) => from === to || transitions[from].includes(to);
export function transitionBooking(from: BookingState, to: BookingState): BookingState {
  if (!canTransitionBooking(from, to)) throw new Error(`Invalid booking transition: ${from} -> ${to}`);
  return to;
}
