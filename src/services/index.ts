import type { Cart, Flight, Hotel, Order, Tour, User } from '@/types/travel';
import type { FlightResult, FlightSearchParams as ResultSearchParams } from '@/types/flight';
import { getFlightsForRoute } from '@/data/flights';

export interface FlightSearchParams { origin?: string; destination?: string; departureDate?: string; }
export interface TravelServices {
  authService: { getCurrentUser: () => Promise<User | null> };
  flightService: { search: (params: FlightSearchParams) => Promise<Flight[]> };
  hotelService: { search: (query?: string) => Promise<Hotel[]> };
  tourService: { list: () => Promise<Tour[]> };
  cartService: { get: () => Promise<Cart> };
  orderService: { list: () => Promise<Order[]> };
  flightSearchService: { searchFlights: (params: ResultSearchParams) => Promise<FlightResult[]> };
}

/** Mock boundaries intentionally return empty data until feature phases add domain fixtures. */
export const mockServices: TravelServices = {
  authService: { getCurrentUser: async () => null },
  flightService: { search: async () => [] },
  hotelService: { search: async () => [] },
  tourService: { list: async () => [] },
  cartService: { get: async () => ({ id: 'cart-demo', items: [], total: 0, currency: 'IRR' }) },
  orderService: { list: async () => [] },
  flightSearchService: { searchFlights: async (params) => getFlightsForRoute(params.from, params.to) },
};
