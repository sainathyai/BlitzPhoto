import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import apiClient from '../lib/axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/authStore';

/**
 * useSessionCheck Hook
 * 
 * Validates the session on app load and periodically.
 * Only runs validation, doesn't redirect (redirects are handled by ProtectedRoute).
 * This prevents race conditions after login.
 */
export function useSessionCheck() {
  const { isAuthenticated, accessToken, refreshToken } = useAuth();
  const navigate = useNavigate();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only check once on mount, not on every auth state change
    // This prevents clearing auth immediately after login
    if (hasCheckedRef.current || !isAuthenticated || !accessToken) {
      return;
    }

    const validateSession = async () => {
      try {
        // Check if access token is expired
        const tokenParts = accessToken.split('.');
        if (tokenParts.length !== 3) {
          console.warn('[Session Check] Invalid token format');
          useAuthStore.getState().clearAuth();
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
              const response = await apiClient.post(`${env.apiUrl}/auth/refresh`, {
                refreshToken,
              });

              // Update auth store with new tokens
              useAuthStore.getState().setAuth(response.data);
              console.log('[Session Check] Token refreshed');
            } catch (error) {
              // Refresh failed - clear auth and redirect
              console.error('[Session Check] Token refresh failed:', error);
              useAuthStore.getState().clearAuth();
              navigate('/login');
            }
          } else {
            // No refresh token - clear auth and redirect
            console.warn('[Session Check] No refresh token available');
            useAuthStore.getState().clearAuth();
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('[Session Check] Error validating session:', error);
        // If we can't parse the token, it's invalid
        useAuthStore.getState().clearAuth();
        navigate('/login');
      } finally {
        hasCheckedRef.current = true;
      }
    };

    // Small delay to ensure auth state is fully set after login
    const timeoutId = setTimeout(validateSession, 100);
    return () => clearTimeout(timeoutId);
  }, []); // Only run once on mount
}

