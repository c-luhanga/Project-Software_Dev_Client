import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectIsAuthenticated, selectIsLoading } from '../../store/authSlice';

// Add a selector for auth status to check if we're still in initial state
const selectAuthStatus = (state: any) => state.auth.status;

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
  // Get admin status and other auth info from Redux store
  const isAdmin = useSelector(selectIsAdmin);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const authStatus = useSelector(selectAuthStatus);
  
  // Debug logging
  console.log('AdminRoute - authStatus:', authStatus);
  console.log('AdminRoute - isLoading:', isLoading);
  console.log('AdminRoute - isAuthenticated:', isAuthenticated);
  console.log('AdminRoute - isAdmin:', isAdmin);

  // Wait for auth to finish loading before making any decisions
  // Also wait if we're in the initial state where loading is false but no auth decision has been made yet
  if (isLoading || authStatus === 'idle') {
    // Additional check: if we're not loading but also not authenticated and no admin status,
    // we might be in the initial render state - wait a moment
    console.log('AdminRoute - Waiting for auth state to stabilize...');
    return <div>Loading...</div>;
  }

  // Check authentication first
  if (!isAuthenticated) {
    console.log('AdminRoute - Redirecting to home, user not authenticated');
    return <Navigate to="/" replace />;
  }

  // Then check admin status
  if (!isAdmin) {
    console.log('AdminRoute - Redirecting to home, user is not admin');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute - Allowing access, user is admin');
  // Render nested admin routes for authorized admins
  return <Outlet />;
};

export default AdminRoute;