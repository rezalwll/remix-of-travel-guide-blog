import { beforeEach, describe, expect, it, vi } from 'vitest';
import { backend } from '@/services/backend';
import { restoreSession, verifyOtp } from '@/services/auth';

vi.mock('@/services/backend', () => ({
  backend: {
    me: vi.fn(),
    verifyOtp: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

describe('API authentication service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps the HttpOnly-backed session user', async () => {
    vi.mocked(backend.me).mockResolvedValue({ user: { id: 'user-1', mobile: '09121234567', firstName: 'رضا', lastName: 'احمدی' } });
    const session = await restoreSession();
    expect(session?.user.mobile).toBe('09121234567');
  });

  it('applies registration profile after OTP verification', async () => {
    vi.mocked(backend.verifyOtp).mockResolvedValue({ user: { id: 'user-1', mobile: '09121234567', firstName: '', lastName: '' } });
    vi.mocked(backend.updateProfile).mockResolvedValue({ user: { id: 'user-1', mobile: '09121234567', firstName: 'رضا', lastName: 'احمدی' } });
    const session = await verifyOtp('challenge-1', '12345', { firstName: 'رضا', lastName: 'احمدی' });
    expect(session.user.firstName).toBe('رضا');
    expect(backend.verifyOtp).toHaveBeenCalledWith('challenge-1', '12345');
  });
});
