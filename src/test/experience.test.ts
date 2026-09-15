import { describe, expect, it } from 'vitest';
import { tours, ziyaratOffers } from '@/data/experiences';
import { calculateExperiencePrice, defaultExperienceFilters, filterExperiences, sortExperiences } from '@/services/experienceService';

describe('tour and ziyarat experience services', () => {
  it('filters and sorts tours', () => { const istanbul=filterExperiences(tours,{...defaultExperienceFilters,destination:'استانبول'}); expect(istanbul.length).toBe(2); const sorted=sortExperiences(tours,'price'); expect(sorted[0].startingPrice).toBeLessThanOrEqual(sorted.at(-1)?.startingPrice||0); });
  it('filters ziyarat by transport', () => { const ground=filterExperiences(ziyaratOffers,{...defaultExperienceFilters,transport:['زمینی']}); expect(ground.length).toBeGreaterThan(0); expect(ground.every((item)=>item.departureOptions.some((departure)=>departure.transport==='زمینی'))).toBe(true); });
  it('calculates package price by traveler type', () => { const offer=tours[0]; const pack=offer.packages[0]; const pricing=calculateExperiencePrice(offer,offer.departureOptions[0].id,pack.id,[{ageCategory:'adult'},{ageCategory:'adult'},{ageCategory:'child'}]); expect(pricing.base).toBe(pack.pricePerAdult*2+pack.pricePerChild); });
});
