import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import Routes from './routes';
import { useTokenRefresh } from './hooks/useTokenRefresh';

/**
 * App Component
 * 
 * Root component with React Query provider and routing.
 * Includes token refresh hook for proactive session management.
 */
function App() {
  // Proactively refresh tokens before expiration
  useTokenRefresh();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  );
}

export default App;
