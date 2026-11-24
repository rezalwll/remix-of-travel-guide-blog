import { Navigate, useLocation } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import LoadingStatus from '@/components/ui/LoadingStatus';
const Loading = () => <LoadingStatus className="min-h-[60vh]" message="در حال بررسی ورود…" />;
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <Loading />; return user ? <>{children}</> : <Navigate to={`/auth/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />; };
export const GuestRoute = ({ children }: { children: React.ReactNode }) => { const { user, loading } = useAuth(); if (loading) return <Loading />; return user ? <Navigate to="/account" replace /> : <>{children}</>; };
