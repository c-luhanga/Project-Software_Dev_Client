import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { 
  logoutThunk, 
  selectIsAuthenticated, 
  selectAuthUser 
} from './store/authSlice';
import { AppRouter } from './presentation/routes';

/**
 * App shell component following Single Responsibility Principle
 * 
 * Responsibilities:
 * - Render top-level app structure with simplified AppBar
 * - Display auth-aware navigation: "Login/Register" or "UserName + Logout"
 * - Handle UI interactions for navigation (no direct HTTP calls)
 * - Dispatch logout thunk and navigate on logout
 * 
 * Does NOT:
 * - Perform HTTP requests directly (delegated to Redux thunks)
 * - Implement business rules or validation
 * - Handle complex state management beyond UI state
 * - Manage authentication logic (delegated to auth slice)
 */
const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Auth state from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  // Check if we're on an auth page to hide AppBar
  const isAuthPage = location.pathname.startsWith('/auth');

  /**
   * Handle navigation to login page
   */
  const handleLoginNavigation = () => {
    navigate('/auth/login');
  };

  /**
   * Handle navigation to register page
   */
  const handleRegisterNavigation = () => {
    navigate('/auth/register');
  };

  /**
   * Handle user logout - dispatches Redux thunk only (SRP compliance)
   * Thunk handles: token clearing, storage cleanup, HTTP client cleanup
   */
  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/auth/login');
  };

  /**
   * Handle home navigation
   */
  const handleHome = () => {
    navigate('/');
  };

  /**
   * Render authenticated user section - simplified UX
   * Shows user display name and logout button only
   */
  const renderAuthenticatedUser = () => {
    // Create display name from user data
    const displayName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.email || 'User';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* User Display Name */}
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 500,
            display: { xs: 'none', sm: 'block' } 
          }}
        >
          {displayName}
        </Typography>
        
        {/* Logout Button */}
        <Button
          color="inherit"
          onClick={handleLogout}
          sx={{
            textTransform: 'none',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    );
  };

  /**
   * Render unauthenticated user section
   */
  const renderUnauthenticatedUser = () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        color="inherit"
        onClick={handleLoginNavigation}
        sx={{ textTransform: 'none' }}
      >
        Login
      </Button>
      <Button
        variant="outlined"
        onClick={handleRegisterNavigation}
        sx={{
          textTransform: 'none',
          borderColor: 'white',
          color: 'white',
          '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Register
      </Button>
    </Box>
  );

  return (
    <Box sx={{ 
      flexGrow: 1,
      width: '100%',
      minHeight: '100vh'
    }}>
      {/* App Bar - Hidden on auth pages */}
      {!isAuthPage && (
        <AppBar position="static" elevation={2}>
          <Toolbar>
            {/* App Logo/Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                flexGrow: 0,
              }}
              onClick={handleHome}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mr: 2,
                }}
              >
                UniShare
              </Typography>
            </Box>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Navigation Section */}
            {isAuthenticated ? renderAuthenticatedUser() : renderUnauthenticatedUser()}
          </Toolbar>
        </AppBar>
      )}

      {/* Main Content */}
      <Box component="main">
        <AppRouter />
      </Box>
    </Box>
  );
};

export default App;
