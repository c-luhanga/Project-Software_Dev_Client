import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Link } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  registerThunk,
  selectAuthStatus, 
  selectAuthError, 
  selectIsAuthenticated,
  clearError 
} from '../../../store/authSlice';
import { RegisterForm } from '../../components/auth';
import type { RegisterRequest } from '../../../types/auth';

/**
 * Register page container following Single Responsibility and Dependency Inversion Principles
 * 
 * Responsibilities:
 * - Connect RegisterForm to Redux state and actions
 * - Handle navigation and side effects
 * - Manage registration flow orchestration
 * - Auto-login after successful registration
 * 
 * Dependencies:
 * - Depends on Redux slice/thunks (DIP through Redux abstractions)
 * - Does NOT depend on repositories/services directly
 * - Uses navigation abstraction for routing
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Select auth state from Redux store
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Derived state for UI
  const isLoading = authStatus === 'loading';

  /**
   * Handle registration form submission
   * Dispatches register thunk and handles success with auto-login
   */
  const handleRegister = async (userData: RegisterRequest) => {
    try {
      // Clear any previous errors
      if (authError) {
        dispatch(clearError());
      }

      // Dispatch register thunk - DIP through Redux thunk abstraction
      const result = await dispatch(registerThunk(userData));
      
      // Handle successful registration
      if (registerThunk.fulfilled.match(result)) {
        // Registration automatically logs the user in through the service
        // Navigate to home page after successful registration and auto-login
        navigate('/', { replace: true });
      }
      // Error handling is automatic through Redux slice
    } catch (error) {
      // Error handling is managed by Redux slice
      console.error('Registration error:', error);
    }
  };

  /**
   * Handle login navigation
   */
  const handleLoginNavigation = () => {
    navigate('/auth/login');
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
              Join our knowledge sharing community
            </Typography>
          </Box>

          {/* Registration Form - Pure presentational component */}
          <RegisterForm
            onSubmit={handleRegister}
            loading={isLoading}
            error={authError}
            onLoginNavigation={handleLoginNavigation}
            submitButtonText="Create UniShare Account"
          />

          {/* Terms and Privacy */}
          <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="caption" color="text.secondary">
              By creating an account, you agree to our{' '}
              <Link
                href="/terms"
                color="primary"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link
                href="/privacy"
                color="primary"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Privacy Policy
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

export default RegisterPage;