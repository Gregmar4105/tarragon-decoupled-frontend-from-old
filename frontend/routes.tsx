/**
 * ─── Larable Frontend Routes ─────────────────────────────────────────
 *
 * This file mirrors Laravel's routes/api.php pattern.
 * It serves as the single source of truth for all frontend routes.
 *
 * Structure:
 *   - Public routes: accessible without authentication
 *   - Protected routes: require authentication (wrapped in ProtectedRoute)
 *
 * Usage: Import `routes` in App.tsx and pass to useRoutes()
 */

import { RouteObject, Navigate } from 'react-router-dom';
import Layout from './src/components/Layout';
import ProtectedRoute from './src/components/ProtectedRoute';
import AuthLayout from './src/components/AuthLayout';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import ForgotPassword from './src/pages/ForgotPassword';
import ResetPassword from './src/pages/ResetPassword';
import Dashboard from './src/pages/Dashboard';
import Settings from './src/pages/Settings';
import PricingPlans from './src/pages/PricingPlans';
import AddWalkIn from './src/pages/AddWalkIn';
import PaymentsTransaction from './src/pages/PaymentsTransaction';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // ─── Public Routes ──────────────────────────────────────────
      { index: true, element: <Home /> },

      // ─── Protected Routes ───────────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'settings', element: <Settings /> },
          { path: 'pricing-plans', element: <PricingPlans /> },
          { path: 'add-walk-in', element: <AddWalkIn /> },
          { path: 'payments-transaction', element: <PaymentsTransaction /> },
        ],
      },
    ],
  },
  // ─── Auth Routes (No Navbar, Split Layout) ──────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
    ],
  },
  // ─── Disabled Registration (Redirect to Login) ──────────────────
  {
    path: 'register',
    element: <Navigate to="/login" replace />,
  },
];
