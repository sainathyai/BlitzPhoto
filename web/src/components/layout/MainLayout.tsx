import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * MainLayout Component
 * 
 * Main layout wrapper with header for authenticated pages.
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

