import { beforeEach, describe, expect, it } from 'vitest';
import { getCurrentSession, logout, verifyOtp } from '@/services/auth';

describe('mock authentication', () => {
  beforeEach(() => localStorage.clear());

  it('creates and clears a demo session', () => {
    const session = verifyOtp('09121234567', '12345');
    expect(session.user.mobile).toBe('09121234567');
    expect(getCurrentSession()?.user.id).toBe(session.user.id);
    logout();
    expect(getCurrentSession()).toBeNull();
  });

  it('rejects an invalid demo otp', () => {
    expect(() => verifyOtp('09121234567', '99999')).toThrow();
  });
});
