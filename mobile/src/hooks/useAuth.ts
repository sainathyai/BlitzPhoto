/**
 * useAuth Hook
 * 
 * Custom hook for accessing authentication state and actions.
 */

import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    setAuth,
    setUser,
    clearAuth,
  } = useAuthStore();

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    setAuth,
    setUser,
    clearAuth,
  };
}

