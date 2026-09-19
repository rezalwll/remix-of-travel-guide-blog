import { createContext, useContext } from 'react';
import type { AuthSession, AuthUser } from '@/types/auth';

export interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  login: (challengeId: string, code: string, registration?: Pick<AuthUser, 'firstName' | 'lastName' | 'email'>) => Promise<AuthSession>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'birthDate' | 'nationalId'>>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
};
