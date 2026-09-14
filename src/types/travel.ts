export type ID = string;
export type Currency = 'IRR' | 'USD' | 'EUR';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'completed';
export type RefundStatus = 'requested' | 'processing' | 'completed' | 'rejected';

export interface User { id: ID; firstName: string; lastName: string; mobile: string; email?: string; avatarUrl?: string; }
export interface Passenger { id: ID; firstName: string; lastName: string; firstNameLatin: string; lastNameLatin: string; nationalId?: string; passportNumber?: string; birthDate: string; nationality: string; }
export interface Airline { id: ID; name: string; code: string; logoUrl?: string; }
export interface Airport { id: ID; name: string; city: string; country: string; iataCode: string; }
export interface FlightSegment { id: ID; origin: Airport; destination: Airport; departureAt: string; arrivalAt: string; durationMinutes: number; airline: Airline; flightNumber: string; }
export interface FlightPrice { amount: number; currency: Currency; adultCount: number; taxes: number; }
export interface FlightBaggage { checkedKg: number; cabinKg: number; }
export interface FlightRule { refundable: boolean; changeable: boolean; cancellationNote?: string; }
export interface Flight { id: ID; segments: FlightSegment[]; price: FlightPrice; baggage: FlightBaggage; rules: FlightRule; }
export interface HotelAmenity { id: ID; name: string; icon?: string; }
export interface RoomRate { id: ID; title: string; amount: number; currency: Currency; mealPlan: string; refundable: boolean; }
export interface Room { id: ID; title: string; capacity: number; amenities: HotelAmenity[]; rates: RoomRate[]; }
export interface Hotel { id: ID; name: string; city: string; country: string; rating: number; reviewCount: number; imageUrl?: string; amenities: HotelAmenity[]; rooms: Room[]; }
export interface TourDate { id: ID; startDate: string; endDate: string; remainingCapacity: number; price: number; currency: Currency; }
export interface TourService { title: string; description?: string; included: boolean; }
export interface Tour { id: ID; title: string; destination: string; durationDays: number; imageUrl?: string; dates: TourDate[]; services: TourService[]; }
export interface Destination { id: ID; slug: string; name: string; country: string; description?: string; imageUrl?: string; }
export interface CartItem { id: ID; type: 'flight' | 'hotel' | 'tour' | 'service'; title: string; quantity: number; unitPrice: number; currency: Currency; metadata?: Record<string, string>; }
export interface Cart { id: ID; items: CartItem[]; coupon?: Coupon; total: number; currency: Currency; }
export interface Coupon { code: string; discountAmount: number; expiresAt?: string; }
export interface OrderItem { id: ID; title: string; type: CartItem['type']; amount: number; }
export interface Order { id: ID; trackingCode: string; userId: ID; status: OrderStatus; items: OrderItem[]; total: number; currency: Currency; createdAt: string; }
export interface PaymentMethod { id: ID; title: string; type: 'card' | 'wallet' | 'gateway'; }
export interface Transaction { id: ID; amount: number; currency: Currency; status: 'success' | 'failed' | 'pending'; reference?: string; createdAt: string; }
export interface Payment { id: ID; orderId: ID; method: PaymentMethod; transaction?: Transaction; }
export interface Notification { id: ID; title: string; body: string; read: boolean; createdAt: string; }
export interface Refund { id: ID; orderId: ID; amount: number; currency: Currency; status: RefundStatus; reason?: string; createdAt: string; }
export interface Favorite { id: ID; userId: ID; itemType: 'hotel' | 'tour' | 'destination'; itemId: ID; }
export interface SupportTicket { id: ID; subject: string; status: 'open' | 'pending' | 'closed'; createdAt: string; }
