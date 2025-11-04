import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage, RegisterPage } from '../pages/auth';
import HomePage from '../pages/home/HomePage';
import SellItemPage from '../pages/items/SellItemPage';
import MyListingsPage from '../pages/items/MyListingsPage';
import ItemDetailPage from '../pages/items/ItemDetailPage';
import { ProfilePage } from '../pages/profile';
import { InboxPage } from '../pages/messaging/InboxPage';
import { ChatPage } from '../pages/messaging/ChatPage';

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
      
      {/* Public Item Routes - Browse items and view details without auth */}
      <Route path="/" element={<HomePage />} />
      <Route path="/items/:id" element={<ItemDetailPage />} />
      
      {/* Protected Item Routes - User must be authenticated */}
      <Route
        path="/items/sell"
        element={
          <ProtectedRoute>
            <SellItemPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/items/mine"
        element={
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Messaging Routes - User must be authenticated */}
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/inbox/:conversationId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      
      {/* Messages route alias - redirects to inbox */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Navigate to="/inbox" replace />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Dashboard and Profile Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomePage />
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