import { Navigate, useLocation } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
const Loading = () => <div className="grid min-h-[60vh] place-items-center"><div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <Loading />; return user ? <>{children}</> : <Navigate to={`/auth/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />; };
export const GuestRoute = ({ children }: { children: React.ReactNode }) => { const { user, loading } = useAuth(); if (loading) return <Loading />; return user ? <Navigate to="/account" replace /> : <>{children}</>; };
