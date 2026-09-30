import { describe, expect, it } from 'vitest';
import { hotels } from '@/data/hotels';
import { calculateNights, filterHotels, getHotelStartingPrice, hotelService, resolveHotelDestination, sortHotels } from '@/services/hotelService';
import type { HotelFilters } from '@/types/hotel';
import fs from 'node:fs';
import path from 'node:path';

const baseFilters: HotelFilters = { minPrice: 0, maxPrice: 50000000, stars: [], minRating: 0, area: [], amenities: [], mealPlan: 'all', refundable: 'all', tags: [] };

describe('hotel service', () => {
  it('calculates nights and handles invalid stays', () => { expect(calculateNights('2026-10-12', '2026-10-16')).toBe(4); expect(calculateNights('2026-10-16', '2026-10-12')).toBe(0); });
  it('filters and sorts deterministic mock hotels', () => { const luxury = filterHotels(hotels, { ...baseFilters, stars: [5] }); expect(luxury.length).toBeGreaterThan(0); expect(luxury.every((hotel) => hotel.stars === 5)).toBe(true); const sorted = sortHotels(hotels, 'price'); expect(getHotelStartingPrice(sorted[0])).toBeLessThanOrEqual(getHotelStartingPrice(sorted[sorted.length - 1])); });
  it('resolves public destination slugs and IATA codes to the Persian catalog city', () => {
    expect(resolveHotelDestination('mashhad')).toBe('مشهد');
    expect(resolveHotelDestination('MHD')).toBe('مشهد');
    expect(hotelService.searchHotels({ destination: 'mashhad', checkIn: '2026-09-30', checkOut: '2026-11-03', rooms: 1, adults: 1, children: 0 }).length).toBeGreaterThan(0);
  });
  it('keeps a substantial, source-backed catalog for every supported Iranian destination', () => {
    const cities = ['تهران', 'مشهد', 'کیش', 'شیراز', 'اصفهان', 'قشم', 'یزد', 'تبریز', 'رشت'];
    for (const city of cities) {
      const cityHotels = hotels.filter((hotel) => hotel.city === city);
      expect(cityHotels.length, city).toBeGreaterThanOrEqual(5);
      expect(cityHotels.every((hotel) => hotel.source?.url && hotel.reviewCount > 0), city).toBe(true);
    }
  });
  it('serves a local, non-placeholder hero image for every Iranian hotel', () => {
    for (const hotel of hotels) {
      expect(hotel.images[0]).toMatch(/^\/media\/hotels\//);
      expect(fs.existsSync(path.join(process.cwd(), 'public', hotel.images[0]))).toBe(true);
    }
  });
});
