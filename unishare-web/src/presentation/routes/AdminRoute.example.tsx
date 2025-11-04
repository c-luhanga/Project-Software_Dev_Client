/**
 * AdminRoute Integration Example
 * 
 * This file demonstrates how to integrate AdminRoute into the existing AppRouter
 * to protect admin-only routes with proper role-based access control.
 * 
 * Usage Pattern:
 * 1. Wrap admin routes with AdminRoute component
 * 2. Use nested route structure with Outlet pattern
 * 3. AdminRoute automatically redirects non-admin users
 * 4. Admin users can access all nested admin routes
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { AppLayout } from '../layout/AppLayout';

// Example admin components (these would be actual components)
const AdminDashboard = () => <div>Admin Dashboard</div>;
const UserManagement = () => <div>User Management</div>;
const ItemModeration = () => <div>Item Moderation</div>;
const AdminReports = () => <div>Admin Reports</div>;

/**
 * Enhanced AppRouter with Admin Route Protection
 * 
 * This example shows how to integrate AdminRoute into the existing router:
 * - Admin routes are protected by both authentication AND admin role
 * - Non-admin users are redirected to home page
 * - Admin routes use nested structure for clean organization
 */
export const AppRouterWithAdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        
        {/* Existing routes... */}
        <Route index element={<div>Home Page</div>} />
        
        {/* Admin Routes - Protected by Authentication AND Admin Role */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRoute />
            </ProtectedRoute>
          }
        >
          {/* Nested Admin Routes - Only accessible to authenticated admins */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="moderation" element={<ItemModeration />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
        
        {/* Alternative pattern: Individual protected admin routes */}
        <Route path="/admin-alt/*" element={<ProtectedRoute><AdminRoute /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Route>
    </Routes>
  );
};

/**
 * Example Usage in Navigation
 * 
 * Shows how to conditionally render admin navigation links
 * based on user's admin status.
 */
export const NavigationWithAdminLinks: React.FC = () => {
  // This would use the same selector as AdminRoute
  // const isAdmin = useSelector(selectIsAdmin);
  const isAdmin = true; // Example value

  return (
    <nav>
      <a href="/">Home</a>
      <a href="/profile">Profile</a>
      
      {/* Only show admin links to admin users */}
      {isAdmin && (
        <>
          <a href="/admin/dashboard">Admin Dashboard</a>
          <a href="/admin/users">User Management</a>
          <a href="/admin/moderation">Item Moderation</a>
        </>
      )}
    </nav>
  );
};

/**
 * Security Benefits of this Pattern:
 * 
 * 1. Defense in Depth:
 *    - First layer: ProtectedRoute checks authentication
 *    - Second layer: AdminRoute checks admin role
 *    - UI layer: Conditional rendering prevents unauthorized access attempts
 * 
 * 2. Clean Architecture:
 *    - Single Responsibility: Each route guard has one job
 *    - Open/Closed: Easy to add new admin routes without modifying existing code
 *    - Dependency Inversion: Relies on Redux selectors, not direct state access
 * 
 * 3. User Experience:
 *    - Clear redirects prevent confusion
 *    - No broken admin routes for non-admin users
 *    - Consistent behavior across all admin routes
 * 
 * 4. Maintainability:
 *    - Centralized admin access control
 *    - Easy to modify admin permissions in one place
 *    - Type-safe routing with TypeScript
 */

export default AppRouterWithAdminRoutes;