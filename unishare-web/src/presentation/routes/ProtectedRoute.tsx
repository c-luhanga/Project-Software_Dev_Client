import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { selectIsAuthenticated } from '../../store/authSlice';

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
  redirectTo = '/auth/login' 
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

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