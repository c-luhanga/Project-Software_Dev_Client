import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Link } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  loginThunk, 
  selectAuthStatus, 
  selectAuthError, 
  selectIsAuthenticated,
  clearError 
} from '../../../store/authSlice';
import { LoginForm } from '../../components/auth';
import type { LoginRequest } from '../../../types/auth';

/**
 * Login page container following Single Responsibility and Dependency Inversion Principles
 * 
 * Responsibilities:
 * - Connect LoginForm to Redux state and actions
 * - Handle navigation and side effects
 * - Manage authentication flow orchestration
 * 
 * Dependencies:
 * - Depends on Redux slice/thunks (DIP through Redux abstractions)
 * - Does NOT depend on repositories/services directly
 * - Uses navigation abstraction for routing
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Select auth state from Redux store
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Derived state for UI
  const isLoading = authStatus === 'loading';

  /**
   * Handle login form submission
   * Dispatches login thunk and handles success/failure
   */
  const handleLogin = async (credentials: LoginRequest) => {
    try {
      // Clear any previous errors
      if (authError) {
        dispatch(clearError());
      }

      // Dispatch login thunk - DIP through Redux thunk abstraction
      const result = await dispatch(loginThunk(credentials));
      
      // Handle successful login
      if (loginThunk.fulfilled.match(result)) {
        // Navigation side effect handled in container
        navigate('/', { replace: true });
      }
      // Error handling is automatic through Redux slice
    } catch (error) {
      // Error handling is managed by Redux slice
      console.error('Login error:', error);
    }
  };

  /**
   * Handle forgot password navigation
   */
  const handleForgotPassword = () => {
    navigate('/auth/forgot-password');
  };

  /**
   * Handle registration navigation
   */
  const handleRegisterNavigation = () => {
    navigate('/auth/register');
  };

  /**
   * Redirect if already authenticated
   * Side effect handled in container
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Clear errors when component unmounts
   * Cleanup side effect
   */
  useEffect(() => {
    return () => {
      if (authError) {
        dispatch(clearError());
      }
    };
  }, [authError, dispatch]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* App Branding */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #E91E63 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              UniShare
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontSize: '1.1rem' }}
            >
              Share knowledge, build community
            </Typography>
          </Box>

          {/* Login Form - Pure presentational component */}
          <LoginForm
            onSubmit={handleLogin}
            loading={isLoading}
            error={authError}
            onForgotPassword={handleForgotPassword}
            submitButtonText="Sign In to UniShare"
          />

          {/* Register Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={handleRegisterNavigation}
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Create one here
              </Link>
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              © 2025 UniShare. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;