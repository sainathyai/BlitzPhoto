import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/auth/AuthLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * Application Routes
 * 
 * Defines all routes for the application with proper authentication guards.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}

