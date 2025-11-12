import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute Component
 * 
 * For public routes like login/register.
 * Redirects to home if already authenticated.
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect to the page they were trying to access, or home
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

