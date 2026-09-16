import { apiRequest } from './apiClient';

export type ApiUser = { id: string; mobile: string; firstName: string; lastName: string };
export type ApiOrder = { id: string; orderNumber: string; trackingCode: string; serviceType: string; total: number; currency: 'TOMAN'; paymentStatus: string; bookingStatus: string; createdAt: string };
export type ApiCheckout = { id: string; serviceType: string; status: string; total: number; currency: 'TOMAN'; expiresAt: string };

export const backend = {
  requestOtp: (mobile: string) => apiRequest<{ challengeId: string; expiresIn: number; demoCode?: string }>('/api/auth/request-otp', { method: 'POST', body: JSON.stringify({ mobile }) }),
  verifyOtp: (challengeId: string, code: string) => apiRequest<{ user: ApiUser }>('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ challengeId, code }) }),
  me: () => apiRequest<{ user: ApiUser }>('/api/auth/me'),
  logout: () => apiRequest<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  createCheckout: (payload: Record<string, unknown>) => apiRequest<{ checkoutSession: ApiCheckout }>('/api/checkout/sessions', { method: 'POST', body: JSON.stringify(payload) }),
  pay: (checkoutSessionId: string, payload: { idempotencyKey: string; method: string; metadata?: Record<string, unknown> }) => apiRequest<{ payment: unknown; order: ApiOrder }>(`/api/checkout/sessions/${checkoutSessionId}/payments`, { method: 'POST', body: JSON.stringify(payload) }),
  orders: () => apiRequest<{ orders: ApiOrder[] }>('/api/account/orders'),
  wallet: () => apiRequest<{ wallet: { balance: number; currency: 'TOMAN' } }>('/api/account/wallet'),
  track: (identifier: string, mobile: string) => apiRequest<{ tracking: ApiOrder & { buyerMobile: string } }>('/api/order-tracking', { method: 'POST', body: JSON.stringify({ identifier, mobile }) }),
};
