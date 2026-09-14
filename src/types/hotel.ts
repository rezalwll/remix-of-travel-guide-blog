export interface HotelPolicy {
  title: string;
  description: string;
}

export type HotelMealPlan = 'صبحانه' | 'بدون وعده';

export interface HotelRatePlan {
  id: string;
  title: string;
  mealPlan: HotelMealPlan;
  refundable: boolean;
  cancellationSummary: string;
  nightlyPrice: number;
  originalNightlyPrice?: number;
  currency: 'IRR';
  taxesIncluded: boolean;
  remainingRooms?: number;
}

export interface HotelRoom {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  capacity: number;
  bedType: string;
  size?: number;
  images: string[];
  amenities: string[];
  ratePlans: HotelRatePlan[];
}

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  address: string;
  area: string;
  lat?: number;
  lng?: number;
  stars: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  amenities: string[];
  neighborhood: string;
  distanceFromCenter: number;
  checkInTime: string;
  checkOutTime: string;
  policies: HotelPolicy[];
  featured?: boolean;
  tags: string[];
  rooms: HotelRoom[];
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

export type HotelSortMode = 'recommended' | 'price' | 'price-desc' | 'rating' | 'distance';

export interface HotelFilters {
  minPrice: number;
  maxPrice: number;
  stars: number[];
  minRating: number;
  area: string[];
  amenities: string[];
  mealPlan: HotelMealPlan | 'all';
  refundable: 'all' | 'refundable' | 'non-refundable';
  tags: string[];
}

export interface HotelGuest {
  id: string;
  roomIndex: number;
  firstName: string;
  lastName: string;
  ageCategory: 'adult' | 'child';
}

export interface HotelBookingSelection {
  hotel: Hotel;
  room: HotelRoom;
  ratePlan: HotelRatePlan;
  roomCount: number;
  stayParams: HotelSearchParams;
  nights: number;
  guests: HotelGuest[];
  addOns: string[];
}
