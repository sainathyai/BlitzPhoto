/**
 * App Navigator
 * 
 * Root navigator that switches between Auth and Main navigators
 * based on authentication state.
 */

import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand persist to hydrate
  useEffect(() => {
    const checkAndFixAuthState = (state: ReturnType<typeof useAuthStore.getState>) => {
      // If isAuthenticated is true but user is null, clear the invalid state
      if (state.isAuthenticated && !state.user) {
        console.warn('Invalid auth state detected: isAuthenticated=true but user=null. Clearing auth state.');
        useAuthStore.getState().clearAuth();
        return useAuthStore.getState();
      }
      return state;
    };

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      let state = useAuthStore.getState();
      state = checkAndFixAuthState(state);
      setIsHydrated(true);
      console.log('Auth store hydrated. Full state:', {
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user,
        user: state.user,
        hasAccessToken: !!state.accessToken,
        hasRefreshToken: !!state.refreshToken,
      });
    });

    // If already hydrated, set immediately
    if (useAuthStore.persist.hasHydrated()) {
      let state = useAuthStore.getState();
      state = checkAndFixAuthState(state);
      setIsHydrated(true);
      console.log('Auth store already hydrated. Full state:', {
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user,
        user: state.user,
        hasAccessToken: !!state.accessToken,
        hasRefreshToken: !!state.refreshToken,
      });
    }

    return unsubscribe;
  }, []);

  // Show loading screen while hydrating
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  console.log('AppNavigator - isAuthenticated:', isAuthenticated, 'user:', user ? user.email : 'null');

  return (
    <NavigationContainer>
      {isAuthenticated && user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

