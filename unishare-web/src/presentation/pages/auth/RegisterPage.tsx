import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Link, useMediaQuery, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  registerThunk,
  selectAuthStatus, 
  selectAuthError, 
  selectIsAuthenticated
} from '../../../store/authSlice';
import { RegisterForm } from '../../components/auth';
import { AuthErrorDisplay } from '../../components/common/ErrorDisplay';
import { useAuthErrorHandler } from '../../../hooks/useErrorHandler';
import type { RegisterRequest } from '../../../types/auth';

/**
 * Register page container following Single Responsibility and Dependency Inversion Principles
 * 
 * Responsibilities:
 * - Connect RegisterForm to Redux state and actions
 * - Handle navigation and side effects
 * - Manage registration flow orchestration
 * - Auto-login after successful registration
 * - Display user-friendly error messages
 * 
 * Dependencies:
 * - Depends on Redux slice/thunks (DIP through Redux abstractions)
 * - Does NOT depend on repositories/services directly
 * - Uses navigation abstraction for routing
 * - Uses error handling utilities for UX
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { clearAuthError, canRetry } = useAuthErrorHandler();
  
  // Responsive design hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        clearAuthError();
      }

      // Dispatch register thunk - DIP through Redux thunk abstraction
      const result = await dispatch(registerThunk(userData));
      
      // Handle successful registration
      if (registerThunk.fulfilled.match(result)) {
        // Registration successful - redirect to login page
        // User needs to login separately to access the application
        navigate('/auth/login', { 
          replace: true,
          state: { 
            message: 'Registration successful! Please log in with your credentials.' 
          }
        });
      }
      // Error handling is automatic through Redux slice
    } catch (error) {
      // Error handling is managed by Redux slice
      console.error('Registration error:', error);
    }
  };

  /**
   * Handle retry for retryable errors
   */
  const handleRetry = () => {
    // Clear error and let user try again
    clearAuthError();
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
        clearAuthError();
      }
    };
  }, [authError, clearAuthError]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '480px', md: '520px', lg: '560px' },
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 2.5, sm: 4 },
            py: { xs: 1, sm: 0 },
          }}
        >
          {/* App Branding */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 0 }
          }}>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #E91E63 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: { xs: 0.5, sm: 1 },
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: { xs: 1.2, sm: 1.167 },
              }}
            >
              UniShare
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "subtitle1"}
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: { xs: 1.5, sm: 1.6 }
              }}
            >
              Join our knowledge sharing community
            </Typography>
          </Box>

          {/* Error Display */}
          <Box sx={{ 
            width: '100%',
            px: { xs: 1, sm: 0 }
          }}>
            <AuthErrorDisplay
              error={authError || null}
              onClose={clearAuthError}
              onRetry={canRetry(authError || null) ? handleRetry : undefined}
              data-testid="register-error"
            />
          </Box>

          {/* Registration Form - Pure presentational component */}
          <Box sx={{ width: '100%' }}>
            <RegisterForm
              onSubmit={handleRegister}
              loading={isLoading}
              onLoginNavigation={handleLoginNavigation}
              submitButtonText="Create UniShare Account"
            />
          </Box>

          {/* Terms and Privacy */}
          <Box sx={{ 
            textAlign: 'center', 
            maxWidth: { xs: '100%', sm: 400 },
            px: { xs: 1, sm: 0 }
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                lineHeight: { xs: 1.4, sm: 1.5 }
              }}
            >
              By creating an account, you agree to our{' '}
              <Link
                href="/terms"
                color="primary"
                sx={{
                  textDecoration: 'none',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
          <Box sx={{ 
            textAlign: 'center', 
            mt: { xs: 3, sm: 4 },
            px: { xs: 1, sm: 0 }
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                lineHeight: { xs: 1.3, sm: 1.4 }
              }}
            >
              © 2025 UniShare. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;