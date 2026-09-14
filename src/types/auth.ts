export interface AuthUser { id: string; firstName: string; lastName: string; mobile: string; email?: string; birthDate?: string; nationalId?: string; createdAt: string; updatedAt: string; }
export interface AuthSession { user: AuthUser; authenticatedAt: string; }
