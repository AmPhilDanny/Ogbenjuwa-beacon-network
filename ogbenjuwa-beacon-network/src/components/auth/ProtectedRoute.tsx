import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSession } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/** Wrapper for login page — redirects to dashboard if already authenticated */
export function PublicRoute() {
  const session = getSession();

  if (session) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
