import type { BookingDraft, ExperienceCheckoutDraft, HotelBookingDraft, SecondaryCheckoutDraft } from '@/types/checkout';
import type { InstallmentPlan, PaymentMethodKind } from '@/types/payment';
import { backend, type ApiOrder, type CheckoutPayload } from './backend';

export const calculateInstallmentPlans = (total: number): InstallmentPlan[] => [
  { id: 'plan-3', count: 3, upfront: Math.round(total / 3), monthly: Math.round((total - Math.round(total / 3)) / 2), total, label: '۳ قسط' },
  { id: 'plan-4', count: 4, upfront: Math.round(total / 4), monthly: Math.round((total - Math.round(total / 4)) / 3), total, label: '۴ قسط' },
];

export const paymentMethodToApi = (method: PaymentMethodKind) => ({
  online: 'online_mock',
  wallet: 'wallet',
  combined: 'combined',
  installment: 'installment_mock',
  organization: 'organizational_credit_mock',
} as const)[method];

const serviceSnapshot = (draft: BookingDraft): Record<string, unknown> => {
  if (draft.serviceType === 'hotel') {
    const hotel = draft as HotelBookingDraft;
    return { hotel: hotel.hotel, stay: hotel.hotelSearch, room: hotel.hotelRoom, ratePlan: hotel.hotelRatePlan, roomCount: hotel.roomCount, addOns: hotel.hotelAddOns, searchUrl: draft.searchUrl };
  }
  if (draft.serviceType === 'tour' || draft.serviceType === 'ziyarat') {
    const experience = draft as ExperienceCheckoutDraft;
    return { offer: experience.offer, departure: experience.departure, package: experience.package, addOns: experience.addOns, searchUrl: draft.searchUrl };
  }
  if (['train', 'bus', 'insurance', 'cip', 'transfer'].includes(draft.serviceType || '')) {
    const secondary = draft as SecondaryCheckoutDraft;
    return { item: secondary.item, query: secondary.query, selectedSeats: secondary.selectedSeats, addOns: secondary.addOns, searchUrl: draft.searchUrl };
  }
  return { outbound: draft.outbound, inbound: draft.inbound, searchParams: draft.searchParams, searchUrl: draft.searchUrl };
};

const travelers = (draft: BookingDraft): unknown[] => {
  if (draft.serviceType === 'hotel') return (draft as HotelBookingDraft).hotelGuests;
  if (draft.serviceType === 'tour' || draft.serviceType === 'ziyarat') return (draft as ExperienceCheckoutDraft).travelers;
  if (['train', 'bus', 'insurance', 'cip', 'transfer'].includes(draft.serviceType || '')) return (draft as SecondaryCheckoutDraft).travelers;
  return draft.passengers;
};

const addOnCodes = (draft: BookingDraft): string[] => {
  if (draft.serviceType === 'hotel') return (draft as HotelBookingDraft).hotelAddOns;
  if (draft.serviceType === 'tour' || draft.serviceType === 'ziyarat') return (draft as ExperienceCheckoutDraft).addOns;
  if (['train', 'bus', 'insurance', 'cip', 'transfer'].includes(draft.serviceType || '')) return (draft as SecondaryCheckoutDraft).addOns;
  return draft.ancillaries;
};

export const checkoutPayloadFromDraft = (draft: BookingDraft): CheckoutPayload => {
  const draftTravelers = travelers(draft);
  return {
    serviceType: draft.serviceType || 'flight',
    quantity: Math.max(1, draftTravelers.length),
    guestMobile: draft.buyer.mobile,
    buyer: { ...draft.buyer },
    travelers: draftTravelers,
    service: serviceSnapshot(draft),
    addOns: addOnCodes(draft).map((code) => ({ code })),
    coupon: draft.coupon?.code,
  };
};

export const createServerCheckout = async (draft: BookingDraft) => (await backend.createCheckout(checkoutPayloadFromDraft(draft))).checkoutSession;
export const payServerCheckout = async (checkoutId: string, method: PaymentMethodKind, idempotencyKey: string, metadata?: Record<string, unknown>) => backend.pay(checkoutId, { method: paymentMethodToApi(method), idempotencyKey, metadata });
export const listOrders = async (): Promise<ApiOrder[]> => (await backend.orders()).orders;
export const getOrder = async (id: string): Promise<ApiOrder> => (await backend.order(id)).order;
export const getWallet = async () => (await backend.wallet()).wallet;
