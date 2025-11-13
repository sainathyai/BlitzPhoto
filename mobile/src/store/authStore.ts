/**
 * Authentication Store
 * 
 * Zustand store for managing authentication state.
 * Persisted to AsyncStorage for session persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AuthResponse, AuthUser } from '../types/api.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (authResponse: AuthResponse) => Promise<void>;
  setUser: (user: AuthUser) => void;
  clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setAuth: async (authResponse: AuthResponse) => {
        console.log('setAuth called with:', {
          userId: authResponse.userId,
          email: authResponse.email,
          username: authResponse.username,
          hasAccessToken: !!authResponse.accessToken,
          hasRefreshToken: !!authResponse.refreshToken,
        });
        
        // Construct user object from flat fields
        const user: AuthUser = {
          id: authResponse.userId,
          email: authResponse.email,
          username: authResponse.username,
        };
        
        if (!user.id || !user.email) {
          console.error('AuthResponse missing required fields!', authResponse);
        }
        
        const newState = {
          user,
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          isAuthenticated: !!user.id && !!authResponse.accessToken,
        };
        
        console.log('Setting auth state:', newState);
        set(newState);
        
        // Also store in AsyncStorage for API interceptor
        await AsyncStorage.setItem('accessToken', authResponse.accessToken);
        await AsyncStorage.setItem('refreshToken', authResponse.refreshToken);
      },
      
      setUser: (user: AuthUser) => {
        set({ user });
      },
      
      clearAuth: async () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        
        // Clear AsyncStorage
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

