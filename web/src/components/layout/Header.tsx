import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Header Component
 * 
 * Application header with navigation and user menu.
 */
export default function Header() {
  const { isAuthenticated, user, clearAuth } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              BlitzPhoto
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">Welcome, {user?.username}</span>
                <button
                  onClick={clearAuth}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

