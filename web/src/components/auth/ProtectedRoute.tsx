import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Guards routes that require authentication.
 * Redirects to login if not authenticated, preserving the intended destination.
 * Session validation is handled at the app level, not on every route change.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the location they were trying to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

