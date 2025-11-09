/**
 * BlitzPhoto Mobile App
 * 
 * Main application entry point with providers and navigation.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/services/queryClient';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
