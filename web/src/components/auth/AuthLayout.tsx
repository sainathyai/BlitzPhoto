import { Outlet } from 'react-router-dom';

/**
 * AuthLayout Component
 * 
 * Clean layout for authentication pages (login/register).
 * No header, full-screen with gradient background.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

