import { hotels } from '@/data/hotels';
import type { Hotel, HotelFilters, HotelSearchParams, HotelSortMode, HotelRoom } from '@/types/hotel';

export const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 86400000);
};

export const getHotelStartingPrice = (hotel: Hotel) => Math.min(...hotel.rooms.flatMap((room) => room.ratePlans.map((rate) => rate.nightlyPrice)));
export const getHotelRooms = (hotel: Hotel, params: HotelSearchParams): HotelRoom[] => hotel.rooms.filter((room) => room.capacity >= Math.ceil(params.adults / Math.max(1, params.rooms))).map((room) => ({ ...room, ratePlans: room.ratePlans.filter((rate) => rate.remainingRooms === undefined || rate.remainingRooms >= params.rooms) }));

export const filterHotels = (items: Hotel[], filters: HotelFilters) => items.filter((hotel) => {
  const price = getHotelStartingPrice(hotel);
  const hasAmenities = filters.amenities.every((amenity) => hotel.amenities.includes(amenity));
  const hasTags = filters.tags.length === 0 || filters.tags.some((tag) => hotel.tags.includes(tag));
  const hasArea = filters.area.length === 0 || filters.area.includes(hotel.area);
  const hasMeal = filters.mealPlan === 'all' || hotel.rooms.some((room) => room.ratePlans.some((rate) => rate.mealPlan === filters.mealPlan));
  const hasRefund = filters.refundable === 'all' || hotel.rooms.some((room) => room.ratePlans.some((rate) => filters.refundable === 'refundable' ? rate.refundable : !rate.refundable));
  return price >= filters.minPrice && price <= filters.maxPrice && (filters.stars.length === 0 || filters.stars.includes(hotel.stars)) && hotel.rating >= filters.minRating && hasAmenities && hasTags && hasArea && hasMeal && hasRefund;
});

export const sortHotels = (items: Hotel[], mode: HotelSortMode) => [...items].sort((a, b) => {
  if (mode === 'price') return getHotelStartingPrice(a) - getHotelStartingPrice(b);
  if (mode === 'price-desc') return getHotelStartingPrice(b) - getHotelStartingPrice(a);
  if (mode === 'rating') return b.rating - a.rating || b.reviewCount - a.reviewCount;
  if (mode === 'distance') return a.distanceFromCenter - b.distanceFromCenter;
  const score = (hotel: Hotel) => hotel.rating * 10 + Math.min(hotel.reviewCount / 100, 15) - getHotelStartingPrice(hotel) / 3000000 - hotel.distanceFromCenter / 20;
  return score(b) - score(a);
});

export const hotelService = {
  searchHotels: (params: HotelSearchParams, filters?: HotelFilters, sort: HotelSortMode = 'recommended') => {
    const destination = params.destination.trim().toLowerCase();
    const matching = hotels.filter((hotel) => `${hotel.city} ${hotel.name} ${hotel.country} ${hotel.area}`.toLowerCase().includes(destination));
    return sortHotels(filters ? filterHotels(matching, filters) : matching, sort);
  },
  getHotelById: (id: string) => hotels.find((hotel) => hotel.id === id || hotel.slug === id) ?? null,
  getRooms: (hotelId: string, params: HotelSearchParams) => { const hotel = hotels.find((item) => item.id === hotelId); return hotel ? getHotelRooms(hotel, params) : []; },
};
