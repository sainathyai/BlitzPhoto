/**
 * App Navigator
 * 
 * Root navigator that switches between Auth and Main navigators
 * based on authentication state.
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

