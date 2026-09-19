import { describe, expect, it, vi } from 'vitest';
import { backend } from '@/services/backend';
import { findPublicOrder, maskMobile } from '@/services/orderTracking';

vi.mock('@/services/backend', () => ({ backend: { track: vi.fn() } }));

describe('public order tracking', () => {
  it('delegates lookup and mobile matching to the API', async () => {
    const tracking = { orderNumber: 'KIA-2026-000001', trackingCode: 'TRK-1', serviceType: 'flight', summary: {}, relevantDate: null, paymentStatus: 'paid' as const, bookingStatus: 'confirmed' as const, total: 8900000, currency: 'TOMAN' as const, createdAt: new Date().toISOString(), buyerMobile: '0912***4567' };
    vi.mocked(backend.track).mockResolvedValue({ tracking });
    await expect(findPublicOrder(' KIA-2026-000001 ', '0912 1234567')).resolves.toEqual(tracking);
    expect(backend.track).toHaveBeenCalledWith('KIA-2026-000001', '09121234567');
  });

  it('masks mobile numbers in public views', () => expect(maskMobile('09120000000')).toBe('0912•••••••'));
});
