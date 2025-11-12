import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import apiClient from '../lib/axios';
import { env } from '../config/env';

/**
 * useSessionCheck Hook
 * 
 * Validates the session on mount and when auth state changes.
 * Redirects to login if session is invalid.
 */
export function useSessionCheck() {
  const { isAuthenticated, accessToken, refreshToken, clearAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    const validateSession = async () => {
      try {
        // Check if access token is expired
        const tokenParts = accessToken.split('.');
        if (tokenParts.length !== 3) {
          clearAuth();
          navigate('/login');
          return;
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();

        // If access token is expired, try to refresh
        if (currentTime >= expirationTime) {
          if (refreshToken) {
            try {
              await apiClient.post(`${env.apiUrl}/auth/refresh`, {
                refreshToken,
              });

              // Update auth - this will be handled by setAuth
              // The token refresh hook will handle the actual update
              console.log('[Session Check] Token refreshed');
            } catch (error) {
              // Refresh failed - clear auth and redirect
              console.error('[Session Check] Token refresh failed:', error);
              clearAuth();
              navigate('/login');
            }
          } else {
            // No refresh token - clear auth and redirect
            clearAuth();
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('[Session Check] Error validating session:', error);
        // If we can't parse the token, it's invalid
        clearAuth();
        navigate('/login');
      }
    };

    validateSession();
  }, [isAuthenticated, accessToken, refreshToken, clearAuth, navigate]);
}

