import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutThunk, selectAuthUser } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

/**
 * Placeholder home page component
 * Displays welcome message and basic user info for authenticated users
 */
export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/auth/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* App Branding */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #E91E63 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
            }}
          >
            Welcome to UniShare
          </Typography>

          {/* Welcome Message */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 600,
              width: '100%',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Hello, {user?.firstName || 'User'}! 👋
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Welcome to your UniShare dashboard. This is a placeholder page for the main application.
              Your authentication system is working perfectly!
            </Typography>

            {user && (
              <Box sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Your Profile:
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Account Type:</strong> {user.isAdmin ? 'Administrator' : 'User'}
                </Typography>
              </Box>
            )}

            <Button
              variant="outlined"
              color="primary"
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Paper>

          {/* Coming Soon Features */}
          <Box sx={{ textAlign: 'center', maxWidth: 800 }}>
            <Typography variant="h6" gutterBottom>
              Coming Soon:
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
                mt: 2,
              }}
            >
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  📚 Knowledge Sharing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share and discover knowledge with your community
                </Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  💬 Messaging
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect and communicate with other users
                </Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  🔍 Item Discovery
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find and share items within your community
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;