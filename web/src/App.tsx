import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import Routes from './routes';

/**
 * App Component
 * 
 * Root component with React Query provider and routing.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  );
}

export default App;
