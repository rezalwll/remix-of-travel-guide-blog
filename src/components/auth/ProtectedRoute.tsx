import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => { const { user } = useAuth(); const location = useLocation(); return user ? <>{children}</> : <Navigate to={`/auth/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />; };
export const GuestRoute = ({ children }: { children: React.ReactNode }) => { const { user } = useAuth(); return user ? <Navigate to="/account" replace /> : <>{children}</>; };
