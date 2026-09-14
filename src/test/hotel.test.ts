import { describe, expect, it } from 'vitest';
import { hotels } from '@/data/hotels';
import { calculateNights, filterHotels, getHotelStartingPrice, sortHotels } from '@/services/hotelService';
import type { HotelFilters } from '@/types/hotel';

const baseFilters: HotelFilters = { minPrice: 0, maxPrice: 50000000, stars: [], minRating: 0, area: [], amenities: [], mealPlan: 'all', refundable: 'all', tags: [] };

describe('hotel service', () => {
  it('calculates nights and handles invalid stays', () => { expect(calculateNights('2026-10-12', '2026-10-16')).toBe(4); expect(calculateNights('2026-10-16', '2026-10-12')).toBe(0); });
  it('filters and sorts deterministic mock hotels', () => { const luxury = filterHotels(hotels, { ...baseFilters, stars: [5] }); expect(luxury.length).toBeGreaterThan(0); expect(luxury.every((hotel) => hotel.stars === 5)).toBe(true); const sorted = sortHotels(hotels, 'price'); expect(getHotelStartingPrice(sorted[0])).toBeLessThanOrEqual(getHotelStartingPrice(sorted[sorted.length - 1])); });
});
