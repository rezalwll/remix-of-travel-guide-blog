import type { Currency } from './travel';

export type FlightStopCount = 0 | 1 | 2;
export type FlightKind = 'سیستمی' | 'چارتری';
export interface FlightFare { id: string; title: string; price: number; baggageKg: number; refundable: boolean; changeable: boolean; rules: string; }
export interface FlightSegmentResult { id: string; fromCode: string; fromCity: string; fromAirport: string; toCode: string; toCity: string; toAirport: string; departure: string; arrival: string; durationMinutes: number; airlineName: string; flightNumber: string; }
export interface FlightResult { id: string; airlineName: string; airlineCode: string; flightNumber: string; aircraft: string; fromCode: string; fromCity: string; toCode: string; toCity: string; departure: string; arrival: string; durationMinutes: number; stops: FlightStopCount; stopCity?: string; cabin: string; baggageKg: number; refundable: boolean; kind: FlightKind; price: number; originalPrice?: number; currency: Currency; seatsLeft?: number; tags: string[]; segments: FlightSegmentResult[]; fares: FlightFare[]; }
export interface FlightSearchParams { from: string; to: string; departure: string; returnDate?: string; adults: number; children: number; infants: number; cabin: string; trip: 'roundtrip' | 'oneway' | 'multicity'; }
export type FlightSortMode = 'recommended' | 'price' | 'duration' | 'early' | 'late';
export interface FlightFilters { airlines: string[]; maxPrice: number; stops: string[]; departureBuckets: string[]; refundableOnly: boolean; kinds: string[]; baggage30: boolean; }
