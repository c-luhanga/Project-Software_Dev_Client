import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage, RegisterPage } from '../pages/auth';
import { HomePage } from '../pages/HomePage';

/**
 * Main application router following Single Responsibility Principle
 * 
 * Responsibility:
 * - Define application routes and their corresponding components
 * - Configure protected and public routes
 * - Handle route-level redirects and navigation
 * 
 * Does NOT:
 * - Handle authentication logic (delegated to ProtectedRoute)
 * - Manage global state
 * - Perform API calls or business logic
 */
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
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
        
        {/* Protected Profile Routes (placeholder for future) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;