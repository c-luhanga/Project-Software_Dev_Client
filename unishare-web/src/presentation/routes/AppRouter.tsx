import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage, RegisterPage } from '../pages/auth';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/profile';

/**
 * Main application router following Single Responsibility Principle
 * 
 * Responsibility:
 * - Define application routes and their corresponding components
 * - Configure protected and public routes
 * - Handle route-level redirects and navigation
 * - Protect sensitive routes with authentication guards
 * 
 * Does NOT:
 * - Handle authentication logic (delegated to ProtectedRoute)
 * - Manage global state
 * - Perform API calls or business logic
 * - Provide Router context (moved to higher level)
 */
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Dashboard Routes (placeholder for future) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Items Routes (placeholder for future) */}
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Messages Routes (placeholder for future) */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Profile Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;