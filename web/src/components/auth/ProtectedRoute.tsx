import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSessionCheck } from '../../hooks/useSessionCheck';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Guards routes that require authentication.
 * Validates session and redirects to login if not authenticated,
 * preserving the intended destination.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Validate session on route access
  useSessionCheck();

  if (!isAuthenticated) {
    // Save the location they were trying to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

