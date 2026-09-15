import { describe, expect, it } from 'vitest';
import { secondaryService, sortBuses, sortTrains, calculateBusPrice, calculateInsurancePrice } from '@/services/secondaryService';

describe('secondary travel services', () => {
  it('filters and sorts train and bus offers deterministically', () => {
    const trains = secondaryService.trains.filter((item) => item.origin === 'تهران' && item.destination === 'مشهد');
    expect(sortTrains(trains, 'price')[0].id).toBe('t1');
    expect(sortTrains(trains, 'fast')[0].id).toBe('t2');
    expect(sortBuses(secondaryService.buses.filter((item) => item.origin === 'تهران'), 'vip')[0].busType).toBe('VIP');
  });

  it('calculates quantity-aware prices for bus and insurance', () => {
    expect(calculateBusPrice(secondaryService.buses[0], 3)).toBe(2160000);
    expect(calculateInsurancePrice(secondaryService.insurancePlans[1], 2)).toBe(1580000);
  });
});
