import type { AuthSession, AuthUser } from '@/types/auth';
import { ApiError } from './apiClient';
import { backend, type ApiUser } from './backend';

const toAuthUser = (user: ApiUser): AuthUser => ({
  id: user.id,
  mobile: user.mobile,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email || undefined,
  birthDate: user.birthDate ? user.birthDate.slice(0, 10) : undefined,
  nationalId: user.nationalId || undefined,
  createdAt: user.createdAt || new Date().toISOString(),
  updatedAt: user.updatedAt || new Date().toISOString(),
});

const sessionFromUser = (user: ApiUser): AuthSession => ({ user: toAuthUser(user), authenticatedAt: new Date().toISOString() });

export const restoreSession = async (): Promise<AuthSession | null> => {
  try {
    const { user } = await backend.me();
    return sessionFromUser(user);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

export const requestOtp = (mobile: string) => backend.requestOtp(mobile);

export const verifyOtp = async (
  challengeId: string,
  code: string,
  registration?: Pick<AuthUser, 'firstName' | 'lastName' | 'email'>,
): Promise<AuthSession> => {
  const verified = await backend.verifyOtp(challengeId, code);
  let user = verified.user;
  if (registration) {
    const updated = await backend.updateProfile(registration);
    user = updated.user;
  }
  return sessionFromUser(user);
};

export const logout = () => backend.logout();

export const updateProfile = async (updates: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'birthDate' | 'nationalId'>>): Promise<AuthSession> => {
  const { user } = await backend.updateProfile(updates);
  return sessionFromUser(user);
};

export const demoOtp = '12345';
