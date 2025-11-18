import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { selectIsAuthenticated, selectIsLoading } from '../../store/authSlice';

/**
 * Props interface for ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protected route component following Single Responsibility Principle
 * 
 * Responsibility: 
 * - Check authentication state from Redux
 * - Redirect unauthenticated users to login
 * - Preserve intended destination for post-login redirect
 * 
 * Does NOT:
 * - Handle authentication logic
 * - Manage auth state
 * - Perform API calls
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const location = useLocation();

  // Wait for auth to finish loading before making any decisions
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login with current location
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If authenticated, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;