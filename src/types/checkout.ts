import type { FlightResult } from './flight';
import type { Hotel, HotelGuest, HotelRatePlan, HotelRoom, HotelSearchParams } from './hotel';
import type { ExperienceBookingDraft } from './experience';
import type { SecondaryCheckoutDraft as SecondaryBookingPayload } from './secondary';

export type PassengerType = 'adult' | 'child' | 'infant';
export interface BuyerContact { firstName: string; lastName: string; mobile: string; email: string; }
export interface BookingPassenger { id: string; type: PassengerType; firstNameFa: string; lastNameFa: string; firstNameLatin: string; lastNameLatin: string; gender: string; birthDate: string; nationalId: string; nationality: string; passportNumber: string; passportCountry: string; passportExpiry: string; savedId?: string; }
export interface AncillaryService { id: string; title: string; description: string; price: number; applicable: 'international' | 'all'; }
export interface PriceBreakdown { outbound: number; inbound: number; passengers: number; ancillaries: number; discount: number; total: number; currency: 'IRR'; }
export interface CouponApplication { code: string; discount: number; message: string; }
export interface BookingDraft { serviceType?: 'flight' | 'hotel' | 'tour' | 'ziyarat' | 'train' | 'bus' | 'insurance' | 'cip' | 'transfer'; searchUrl: string; searchParams: Record<string, string>; outbound: FlightResult | null; inbound: FlightResult | null; buyer: BuyerContact; passengers: BookingPassenger[]; ancillaries: string[]; coupon: CouponApplication | null; termsAccepted: boolean; }

export interface HotelBookingDraft extends BookingDraft {
  serviceType: 'hotel';
  hotel: Hotel;
  hotelSearch: HotelSearchParams;
  hotelRoom: HotelRoom;
  hotelRatePlan: HotelRatePlan;
  roomCount: number;
  hotelGuests: HotelGuest[];
  hotelAddOns: string[];
}

export type AnyBookingDraft = BookingDraft | HotelBookingDraft;
export interface ExperienceCheckoutDraft extends BookingDraft, ExperienceBookingDraft { serviceType: 'tour' | 'ziyarat'; experienceType: 'tour' | 'ziyarat'; }
export interface SecondaryCheckoutDraft extends BookingDraft, SecondaryBookingPayload { serviceType: 'train' | 'bus' | 'insurance' | 'cip' | 'transfer'; }
