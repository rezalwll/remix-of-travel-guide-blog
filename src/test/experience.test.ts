import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tours, ziyaratOffers } from '@/data/experiences';
import { shortTours } from '@/data/shortTours';
import { calculateExperiencePrice, defaultExperienceFilters, filterExperiences, sortExperiences } from '@/services/experienceService';

describe('tour and ziyarat experience services', () => {
  it('filters and sorts tours', () => { const istanbul=filterExperiences(tours,{...defaultExperienceFilters,destination:'استانبول'}); expect(istanbul.length).toBe(2); const sorted=sortExperiences(tours,'price'); expect(sorted[0].startingPrice).toBeLessThanOrEqual(sorted[sorted.length-1]?.startingPrice||0); });
  it('filters ziyarat by transport', () => { const ground=filterExperiences(ziyaratOffers,{...defaultExperienceFilters,transport:['زمینی']}); expect(ground.length).toBeGreaterThan(0); expect(ground.every((item)=>item.departureOptions.some((departure)=>departure.transport==='زمینی'))).toBe(true); });
  it('calculates package price by traveler type', () => { const offer=tours[0]; const pack=offer.packages[0]; const pricing=calculateExperiencePrice(offer,offer.departureOptions[0].id,pack.id,[{ageCategory:'adult'},{ageCategory:'adult'},{ageCategory:'child'}]); expect(pricing.base).toBe(pack.pricePerAdult*2+pack.pricePerChild); expect(pricing.currency).toBe('TOMAN'); });
  it('publishes complete one and two-day demo tours with local WebP photos', () => {
    expect(shortTours.length).toBeGreaterThanOrEqual(8);
    expect(new Set(shortTours.map((tour) => tour.slug)).size).toBe(shortTours.length);
    expect(shortTours.every((tour) => tour.durationDays === 1 || tour.durationDays === 2)).toBe(true);
    expect(shortTours.some((tour) => tour.destinations.includes('قمصر'))).toBe(true);
    expect(shortTours.some((tour) => tour.destinations.includes('جمکران'))).toBe(true);
    expect(shortTours.some((tour) => tour.destination === 'کردستان')).toBe(true);
    expect(shortTours.every((tour) => tour.images[0].endsWith('.webp'))).toBe(true);
    expect(shortTours.every((tour) => existsSync(join(process.cwd(), 'public', tour.images[0])))).toBe(true);
  });
});
