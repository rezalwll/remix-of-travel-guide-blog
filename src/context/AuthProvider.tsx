import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthSession } from '@/types/auth';
import * as authService from '@/services/auth';
import { AuthContext, type AuthContextValue } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService.restoreSession()
      .then((next) => { if (active) setSession(next); })
      .catch(() => { if (active) setSession(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user || null,
    loading,
    login: async (challengeId, code, registration) => {
      const next = await authService.verifyOtp(challengeId, code, registration);
      setSession(next);
      return next;
    },
    logout: async () => {
      await authService.logout();
      setSession(null);
    },
    updateProfile: async (updates) => {
      const next = await authService.updateProfile(updates);
      setSession(next);
    },
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
