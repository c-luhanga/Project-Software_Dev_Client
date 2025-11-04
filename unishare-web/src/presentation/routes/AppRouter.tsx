import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { AppLayout } from '../layout/AppLayout';
import { LoginPage, RegisterPage } from '../pages/auth';
import HomePage from '../pages/home/HomePage';
import SellItemPage from '../pages/items/SellItemPage';
import MyListingsPage from '../pages/items/MyListingsPage';
import ItemDetailPage from '../pages/items/ItemDetailPage';
import { ProfilePage } from '../pages/profile';
import { InboxPage } from '../pages/messaging/InboxPage';
import { ChatPage } from '../pages/messaging/ChatPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

/**
 * Main application router following Single Responsibility Principle
 * 
 * Responsibility:
 * - Define application routes and their corresponding components
 * - Configure protected and public routes with consistent layout
 * - Handle route-level redirects and navigation
 * - Protect sensitive routes with authentication guards
 * - Wrap all routes with AppLayout for consistent header and structure
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
      {/* Main Application Layout - All routes render within AppLayout */}
      <Route path="/" element={<AppLayout />}>
        
        {/* Public Routes - No Authentication Required */}
        
        {/* Home Page */}
        <Route index element={<HomePage />} />
        
        {/* Authentication Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Public Item Routes - Browse items and view details without auth */}
        <Route path="items/:id" element={<ItemDetailPage />} />
        
        {/* Protected Routes - User Must Be Authenticated */}
        
        {/* Profile Route */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        {/* Item Management Routes */}
        <Route
          path="items/sell"
          element={
            <ProtectedRoute>
              <SellItemPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="items/mine"
          element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Messaging Routes */}
        <Route
          path="inbox"
          element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="inbox/:conversationId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        
        {/* Route Aliases and Redirects */}
        
        {/* Messages route alias - redirects to inbox */}
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <Navigate to="/inbox" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Dashboard route alias - redirects to home */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes - Protected by Authentication AND Admin Role */}
        <Route
          path="admin/*"
          element={
            <ProtectedRoute>
              <AdminRoute />
            </ProtectedRoute>
          }
        >
          {/* Admin Dashboard - Main admin landing page */}
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          
          {/* User Management - Future admin feature */}
          <Route 
            path="users" 
            element={
              <div style={{ padding: '2rem' }}>
                <h2>User Management</h2>
                <p>User management interface will be implemented here.</p>
              </div>
            } 
          />
        </Route>
        
        {/* Legacy auth routes - redirect to simplified paths */}
        <Route path="auth/login" element={<Navigate to="/login" replace />} />
        <Route path="auth/register" element={<Navigate to="/register" replace />} />
        
        {/* Catch-all redirect - Unknown paths redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Route>
    </Routes>
  );
};

export default AppRouter;