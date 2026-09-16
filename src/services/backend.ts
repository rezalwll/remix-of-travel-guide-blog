import { apiRequest } from './apiClient';

export type ApiUser = {
  id: string;
  mobile: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  birthDate?: string | null;
  nationalId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiOrder = {
  id: string;
  userId?: string | null;
  orderNumber: string;
  trackingCode: string;
  guestMobile?: string | null;
  serviceType: string;
  summary: Record<string, unknown>;
  buyer: Record<string, unknown>;
  travelers: unknown[];
  serviceSnapshot: Record<string, unknown>;
  pricingSnapshot: Record<string, unknown>;
  paymentSnapshot: Record<string, unknown>;
  total: number;
  currency: 'TOMAN';
  paymentStatus: string;
  bookingStatus: string;
  relevantDate?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type ApiCheckout = { id: string; serviceType: string; status: string; total: number; currency: 'TOMAN'; pricing?: Record<string, unknown>; expiresAt: string };
export type ApiWalletTransaction = { id: string; type: string; amount: number; balanceAfter: number; reference: string; createdAt: string };
export type ApiWallet = { id: string; balance: number; currency: 'TOMAN'; updatedAt: string; transactions: ApiWalletTransaction[] };
export type ApiPassenger = { id: string; firstName: string; lastName: string; nationalId?: string | null; passportNumber?: string | null; createdAt: string; updatedAt: string };
export type ApiFavorite = { id: string; itemType: string; itemId: string; createdAt: string };
export type ApiNotification = { id: string; type: string; title: string; body: string; readAt?: string | null; createdAt: string };
export type ApiSupportMessage = { id: string; authorType: string; body: string; createdAt: string };
export type ApiSupportTicket = { id: string; subject: string; status: string; createdAt: string; updatedAt: string; messages: ApiSupportMessage[] };
export type ApiVisaApplication = { id: string; country: string; status: string; payload: Record<string, unknown>; createdAt: string; updatedAt: string };
export type ApiRefund = { id: string; orderId: string; amount: number; reason: string; destination: string; status: string; createdAt: string; updatedAt: string };
export type ApiTracking = Pick<ApiOrder, 'orderNumber' | 'trackingCode' | 'serviceType' | 'summary' | 'relevantDate' | 'paymentStatus' | 'bookingStatus' | 'total' | 'currency' | 'createdAt'> & { buyerMobile: string };

export type CheckoutPayload = {
  serviceType: string;
  quantity: number;
  guestMobile?: string;
  service?: Record<string, unknown>;
  buyer?: Record<string, unknown>;
  travelers?: unknown[];
  addOns?: Array<{ code: string; quantity?: number }>;
  coupon?: string;
};

export const backend = {
  requestOtp: (mobile: string) => apiRequest<{ challengeId: string; expiresIn: number; demoCode?: string }>('/api/auth/request-otp', { method: 'POST', body: JSON.stringify({ mobile }) }),
  verifyOtp: (challengeId: string, code: string) => apiRequest<{ user: ApiUser }>('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ challengeId, code }) }),
  me: () => apiRequest<{ user: ApiUser }>('/api/auth/me'),
  logout: () => apiRequest<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  profile: () => apiRequest<{ user: ApiUser }>('/api/account/profile'),
  updateProfile: (updates: Partial<Pick<ApiUser, 'firstName' | 'lastName' | 'email' | 'birthDate' | 'nationalId'>>) => apiRequest<{ user: ApiUser }>('/api/account/profile', { method: 'PATCH', body: JSON.stringify(updates) }),

  createCheckout: (payload: CheckoutPayload) => apiRequest<{ checkoutSession: ApiCheckout }>('/api/checkout/sessions', { method: 'POST', body: JSON.stringify(payload) }),
  checkout: (id: string) => apiRequest<{ checkoutSession: ApiCheckout }>(`/api/checkout/sessions/${id}`),
  pay: (checkoutSessionId: string, payload: { idempotencyKey: string; method: string; metadata?: Record<string, unknown> }) => apiRequest<{ payment: { reference?: string; walletAmount: number; onlineAmount: number }; order: ApiOrder }>(`/api/checkout/sessions/${checkoutSessionId}/payments`, { method: 'POST', body: JSON.stringify(payload) }),

  orders: () => apiRequest<{ orders: ApiOrder[] }>('/api/account/orders'),
  order: (id: string) => apiRequest<{ order: ApiOrder }>(`/api/account/orders/${id}`),
  wallet: () => apiRequest<{ wallet: ApiWallet }>('/api/account/wallet'),

  passengers: () => apiRequest<{ passengers: ApiPassenger[] }>('/api/account/passengers'),
  createPassenger: (passenger: Pick<ApiPassenger, 'firstName' | 'lastName'> & Partial<Pick<ApiPassenger, 'nationalId' | 'passportNumber'>>) => apiRequest<{ passenger: ApiPassenger }>('/api/account/passengers', { method: 'POST', body: JSON.stringify(passenger) }),
  updatePassenger: (id: string, passenger: Partial<Pick<ApiPassenger, 'firstName' | 'lastName' | 'nationalId' | 'passportNumber'>>) => apiRequest<{ passenger: ApiPassenger }>(`/api/account/passengers/${id}`, { method: 'PATCH', body: JSON.stringify(passenger) }),
  deletePassenger: (id: string) => apiRequest<void>(`/api/account/passengers/${id}`, { method: 'DELETE' }),

  favorites: () => apiRequest<{ favorites: ApiFavorite[] }>('/api/account/favorites'),
  createFavorite: (itemType: string, itemId: string) => apiRequest<{ favorite: ApiFavorite }>('/api/account/favorites', { method: 'POST', body: JSON.stringify({ itemType, itemId }) }),
  deleteFavorite: (id: string) => apiRequest<void>(`/api/account/favorites/${id}`, { method: 'DELETE' }),

  notifications: () => apiRequest<{ notifications: ApiNotification[] }>('/api/account/notifications'),
  readNotification: (id: string) => apiRequest<{ ok: true }>(`/api/account/notifications/${id}/read`, { method: 'PATCH' }),
  readAllNotifications: () => apiRequest<{ ok: true }>('/api/account/notifications/read-all', { method: 'POST' }),

  support: () => apiRequest<{ tickets: ApiSupportTicket[] }>('/api/account/support'),
  createSupport: (subject: string, body: string) => apiRequest<{ ticket: ApiSupportTicket }>('/api/account/support', { method: 'POST', body: JSON.stringify({ subject, body }) }),
  replySupport: (id: string, body: string) => apiRequest<{ message: ApiSupportMessage }>(`/api/account/support/${id}/messages`, { method: 'POST', body: JSON.stringify({ body }) }),

  visaApplications: () => apiRequest<{ applications: ApiVisaApplication[] }>('/api/account/visa-applications'),
  createVisaApplication: (country: string, payload: Record<string, unknown>) => apiRequest<{ application: ApiVisaApplication }>('/api/account/visa-applications', { method: 'POST', body: JSON.stringify({ country, payload }) }),
  updateVisaApplication: (id: string, status: 'draft' | 'submitted', payload?: Record<string, unknown>) => apiRequest<{ application: ApiVisaApplication }>(`/api/account/visa-applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status, payload }) }),

  refunds: () => apiRequest<{ refunds: ApiRefund[] }>('/api/account/refunds'),
  requestRefund: (orderId: string, reason: string, destination: 'wallet' | 'original_payment' = 'original_payment') => apiRequest<{ refund: ApiRefund }>('/api/account/refunds', { method: 'POST', body: JSON.stringify({ orderId, reason, destination }) }),
  track: (identifier: string, mobile: string) => apiRequest<{ tracking: ApiTracking }>('/api/order-tracking', { method: 'POST', body: JSON.stringify({ identifier, mobile }) }),
};
