/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

const fallback = (
  <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
    Loading…
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={fallback}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={fallback}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={fallback}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={fallback}>
                <DashboardPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
