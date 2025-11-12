import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../lib/axios';
import { env } from '../config/env';

/**
 * useTokenRefresh Hook
 * 
 * Proactively refreshes the access token 5 minutes before expiration.
 * Runs on mount and sets up an interval to check token expiration.
 */
export function useTokenRefresh() {
  const { accessToken, refreshToken, isAuthenticated, setAuth } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !refreshToken) {
      return;
    }

    const checkAndRefreshToken = async () => {
      try {
        // Decode JWT to get expiration time (simple base64 decode)
        const tokenParts = accessToken.split('.');
        if (tokenParts.length !== 3) {
          return;
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        // If token expires in less than 5 minutes, refresh it
        if (timeUntilExpiration < fiveMinutes && timeUntilExpiration > 0) {
          try {
            const response = await apiClient.post(`${env.apiUrl}/auth/refresh`, {
              refreshToken,
            });

            const authResponse = response.data;

            // Update auth store
            setAuth(authResponse);

            console.log('[Token Refresh] Token refreshed successfully');
          } catch (error) {
            console.error('[Token Refresh] Failed to refresh token:', error);
            // Don't clear auth here - let the axios interceptor handle it
          }
        }
      } catch (error) {
        console.error('[Token Refresh] Error checking token expiration:', error);
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Check every minute
    intervalRef.current = setInterval(checkAndRefreshToken, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [accessToken, refreshToken, isAuthenticated, setAuth]);
}

