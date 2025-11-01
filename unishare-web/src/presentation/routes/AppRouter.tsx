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
      {/* Public Auth Routes - No Protection Required */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      
      {/* Protected Routes - All Private Routes Wrapped with ProtectedRoute */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      
      {/* Inbox route alias - redirects to messages */}
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <Navigate to="/messages" replace />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all redirect - Unknown paths redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;