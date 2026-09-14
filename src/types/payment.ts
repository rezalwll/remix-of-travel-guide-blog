import type { BookingDraft, HotelBookingDraft, PriceBreakdown } from './checkout';
import type { Hotel, HotelGuest, HotelRatePlan, HotelRoom, HotelSearchParams } from './hotel';
export type PaymentMethodKind = 'online' | 'wallet' | 'combined' | 'installment';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
export interface WalletState { balance: number; currency: 'IRR'; updatedAt: string; }
export interface InstallmentPlan { id: string; count: number; upfront: number; monthly: number; total: number; label: string; }
export interface PaymentAttempt { id: string; draftId: string; method: PaymentMethodKind; amount: number; walletAmount: number; onlineAmount: number; installmentPlan?: InstallmentPlan; status: PaymentStatus; createdAt: string; failureReason?: string; }
export interface TransactionRecord { id: string; attemptId: string; status: PaymentStatus; amount: number; currency: 'IRR'; method: PaymentMethodKind; referenceNumber: string; gatewayName?: string; walletAmount: number; onlineAmount: number; createdAt: string; completedAt?: string; failureReason?: string; }
export interface OrderPaymentSnapshot { method: PaymentMethodKind; transactionReference: string; amount: number; walletAmount: number; onlineAmount: number; installmentPlan?: InstallmentPlan; }
export interface HotelOrderSnapshot { hotel: Hotel; stayParams: HotelSearchParams; room: HotelRoom; ratePlan: HotelRatePlan; roomCount: number; guests: HotelGuest[]; addOns: string[]; nights: number; }
export interface MockOrder { id: string; orderNumber: string; userId?: string; createdAt: string; status: 'confirmed_mock'; paymentStatus: 'paid'; serviceType?: 'flight' | 'hotel'; buyer: BookingDraft['buyer']; passengers: BookingDraft['passengers']; outbound: BookingDraft['outbound']; inbound: BookingDraft['inbound']; ancillaries: string[]; coupon: BookingDraft['coupon']; pricing: PriceBreakdown; payment: OrderPaymentSnapshot; searchUrl: string; hotelSnapshot?: HotelOrderSnapshot; }
