import React from 'react';
import { Box, Typography, Button, Paper, useMediaQuery, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        width: '100%',
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: '100%', sm: '100%', md: '1200px', lg: '1400px', xl: '1600px' },
          mx: 'auto',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 3, sm: 4 },
          }}
        >
          {/* App Branding */}
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #E91E63 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: { xs: 1.2, sm: 1.3 },
              px: { xs: 1, sm: 2 },
            }}
          >
            Welcome to UniShare
          </Typography>

          {/* Welcome Message */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              textAlign: 'center',
              maxWidth: { xs: '100%', sm: 600 },
              width: '100%',
              borderRadius: { xs: 1, sm: 2 },
            }}
          >
            <Typography 
              variant={isMobile ? "h6" : "h5"}
              gutterBottom
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Hello, {user?.firstName || 'User'}! 👋
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: { xs: 1.4, sm: 1.6 },
              }}
            >
              Welcome to your UniShare dashboard. This is a placeholder page for the main application.
              Your authentication system is working perfectly!
            </Typography>

            {user && (
              <Box sx={{ 
                mb: { xs: 2, sm: 3 }, 
                textAlign: 'left',
                px: { xs: 1, sm: 0 } 
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  Your Profile:
                </Typography>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 2 },
                  flexWrap: 'wrap'
                }}>
                  <Typography 
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      flex: { xs: 'none', sm: '1 1 100%' }
                    }}
                  >
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      flex: { xs: 'none', sm: '1 1 100%' }
                    }}
                  >
                    <strong>Email:</strong> {user.email}
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      flex: { xs: 'none', sm: '1 1 100%' }
                    }}
                  >
                    <strong>Account Type:</strong> {user.isAdmin ? 'Administrator' : 'User'}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 3 },
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              mt: { xs: 1, sm: 2 }
            }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/profile')}
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  minWidth: { xs: '100%', sm: 140 },
                  py: { xs: 1.5, sm: 1 }
                }}
              >
                View Profile
              </Button>
              
              <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  minWidth: { xs: '100%', sm: 100 },
                  py: { xs: 1.5, sm: 1 }
                }}
              >
                Logout
              </Button>
            </Box>
          </Paper>

          {/* Coming Soon Features */}
          <Box sx={{ 
            textAlign: 'center', 
            maxWidth: { xs: '100%', sm: 800 },
            px: { xs: 1, sm: 0 }
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                mb: { xs: 2, sm: 3 }
              }}
            >
              Coming Soon:
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { 
                  xs: '1fr', 
                  sm: 'repeat(2, 1fr)', 
                  md: 'repeat(4, 1fr)' 
                },
                gap: { xs: 2, sm: 3 },
                mt: { xs: 2, sm: 3 },
              }}
            >
              <Paper sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: { xs: 1, sm: 2 },
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-2px)' }
                }
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  📚 Knowledge Sharing
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.3, sm: 1.4 }
                  }}
                >
                  Share and discover knowledge with your community
                </Typography>
              </Paper>
              <Paper sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: { xs: 1, sm: 2 },
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-2px)' }
                }
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  💬 Messaging
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.3, sm: 1.4 }
                  }}
                >
                  Connect and communicate with other users
                </Typography>
              </Paper>
              <Paper sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: { xs: 1, sm: 2 },
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-2px)' }
                }
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  🔍 Item Discovery
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.3, sm: 1.4 }
                  }}
                >
                  Find and share items within your community
                </Typography>
              </Paper>
              
              <Paper sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: { xs: 1, sm: 2 },
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-2px)' }
                }
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  🎯 More Features
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.3, sm: 1.4 }
                  }}
                >
                  Additional features coming soon
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;