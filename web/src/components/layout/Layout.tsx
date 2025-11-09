import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * Layout Component
 * 
 * Main layout wrapper with header and navigation.
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

