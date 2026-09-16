import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthSession, AuthUser } from '@/types/auth';
import * as authService from '@/services/auth';
import { clearFavoriteCache, preloadFavorites } from '@/services/account';

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  login: (challengeId: string, code: string, registration?: Pick<AuthUser, 'firstName' | 'lastName' | 'email'>) => Promise<AuthSession>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'birthDate' | 'nationalId'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService.restoreSession()
      .then(async (next) => { if (next) await preloadFavorites().catch(() => undefined); if (active) setSession(next); })
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
      await preloadFavorites().catch(() => undefined);
      setSession(next);
      return next;
    },
    logout: async () => {
      await authService.logout();
      clearFavoriteCache();
      setSession(null);
    },
    updateProfile: async (updates) => {
      const next = await authService.updateProfile(updates);
      setSession(next);
    },
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
};
