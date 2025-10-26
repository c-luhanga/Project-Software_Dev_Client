import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
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
 * - Render top-level app structure with AppBar
 * - Display auth-aware navigation and user controls
 * - Handle UI interactions for login/logout navigation
 * 
 * Does NOT:
 * - Perform HTTP requests directly
 * - Implement business rules or validation
 * - Handle complex state management beyond UI state
 */
const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Auth state from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  // Local UI state for user menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  // Check if we're on an auth page to hide AppBar
  const isAuthPage = location.pathname.startsWith('/auth');

  /**
   * Handle user menu open
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle user menu close
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
   * Handle user logout - dispatches Redux action only
   */
  const handleLogout = async () => {
    handleMenuClose();
    await dispatch(logoutThunk());
    navigate('/auth/login');
  };

  /**
   * Handle profile navigation
   */
  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  /**
   * Handle home navigation
   */
  const handleHome = () => {
    navigate('/');
  };

  /**
   * Render authenticated user menu
   */
  const renderUserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={handleMenuClose}
      onClick={handleMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          minWidth: 180,
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1,
          },
        },
      }}
    >
      <MenuItem onClick={handleProfile}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircle fontSize="small" />
          Profile
        </Box>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>Logout</Typography>
        </Box>
      </MenuItem>
    </Menu>
  );

  /**
   * Render authenticated user section
   */
  const renderAuthenticatedUser = () => (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Welcome, {user?.firstName}
        </Typography>
        <IconButton
          size="large"
          aria-label="account menu"
          aria-controls="user-menu"
          aria-haspopup="true"
          onClick={handleMenuOpen}
          color="inherit"
        >
          {user?.profileImageUrl ? (
            <Avatar
              src={user.profileImageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              sx={{ width: 32, height: 32 }}
            />
          ) : (
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
          )}
        </IconButton>
      </Box>
      {renderUserMenu()}
    </>
  );

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
    <Box sx={{ flexGrow: 1 }}>
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
