import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/authSlice';

/**
 * AdminRoute - Route Guard for Administrative Access
 * 
 * Single Responsibility Principle (SRP):
 * - Solely responsible for admin route access control
 * - Handles only authorization logic, no other concerns
 * - Delegates rendering to child routes via Outlet
 * 
 * Open/Closed Principle (OCP):
 * - Closed for modification but open for extension
 * - Can be wrapped or composed with other route guards
 * - Uses composition pattern with React Router's Outlet
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on Redux selector abstraction (selectIsAdmin)
 * - No direct dependency on auth implementation details
 * - Uses React Router's navigation abstraction
 * 
 * Usage:
 * ```tsx
 * <Route path="/admin" element={<AdminRoute />}>
 *   <Route path="dashboard" element={<AdminDashboard />} />
 *   <Route path="users" element={<UserManagement />} />
 * </Route>
 * ```
 */
const AdminRoute: React.FC = () => {
  // Get admin status from Redux store
  const isAdmin = useSelector(selectIsAdmin);

  // Redirect non-admin users to home page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render nested admin routes for authorized admins
  return <Outlet />;
};

export default AdminRoute;