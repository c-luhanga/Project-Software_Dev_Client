import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Link, Alert, useMediaQuery, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  loginThunk, 
  selectAuthStatus, 
  selectAuthError, 
  selectIsAuthenticated
} from '../../../store/authSlice';
import { LoginForm } from '../../components/auth';
import { AuthErrorDisplay } from '../../components/common/ErrorDisplay';
import { useAuthErrorHandler } from '../../../hooks/useErrorHandler';
import type { LoginRequest } from '../../../types/auth';

/**
 * Login page container following Single Responsibility and Dependency Inversion Principles
 * 
 * Responsibilities:
 * - Connect LoginForm to Redux state and actions
 * - Handle navigation and side effects
 * - Manage authentication flow orchestration
 * - Display user-friendly error messages
 * 
 * Dependencies:
 * - Depends on Redux slice/thunks (DIP through Redux abstractions)
 * - Does NOT depend on repositories/services directly
 * - Uses navigation abstraction for routing
 * - Uses error handling utilities for UX
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { clearAuthError, canRetry } = useAuthErrorHandler();

  // Check for registration success message
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { message?: string })?.message || null
  );

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
        clearAuthError();
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
   * Handle retry for retryable errors
   */
  const handleRetry = () => {
    // Clear error and let user try again
    clearAuthError();
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
   * Handle home navigation
   */
  const handleHomeNavigation = () => {
    navigate('/');
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
            gap: { xs: 3, sm: 4 },
            width: '100%',
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
              }}
            >
              UniShare
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: { xs: 1.3, sm: 1.4 }
              }}
            >
              Share knowledge, build community
            </Typography>
          </Box>

          {/* Success Message from Registration */}
          {successMessage && (
            <Alert 
              severity="success" 
              onClose={() => setSuccessMessage(null)}
              sx={{ 
                width: '100%',
                borderRadius: { xs: 1, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {successMessage}
            </Alert>
          )}

          {/* Error Display */}
          <Box sx={{ width: '100%' }}>
            <AuthErrorDisplay
              error={authError || null}
              onClose={clearAuthError}
              onRetry={canRetry(authError || null) ? handleRetry : undefined}
              data-testid="login-error"
            />
          </Box>

          {/* Login Form - Pure presentational component */}
          <Box sx={{ width: '100%' }}>
            <LoginForm
              onSubmit={handleLogin}
              loading={isLoading}
              onForgotPassword={handleForgotPassword}
              submitButtonText="Sign In to UniShare"
            />
          </Box>

          {/* Register Link */}
          <Box sx={{ 
            textAlign: 'center',
            px: { xs: 1, sm: 0 },
            width: '100%'
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: { xs: 1.4, sm: 1.5 }
              }}
            >
              Don't have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={handleRegisterNavigation}
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Create one here
              </Link>
            </Typography>

            {/* Home Link */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: { xs: 1.4, sm: 1.5 }
              }}
            >
              <Link
                component="button"
                variant="body2"
                onClick={handleHomeNavigation}
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                ← Back to Home
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

export default LoginPage;