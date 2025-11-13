import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

/**
 * MainLayout Component
 * 
 * Main layout with sidebar navigation and footer for authenticated pages.
 */
export default function MainLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - only show when authenticated */}
        {isAuthenticated && <Sidebar />}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-100">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          
          {/* Footer */}
          {isAuthenticated && <Footer />}
        </div>
      </div>
    </div>
  );
}

