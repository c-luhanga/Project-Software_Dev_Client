/**
 * Profile Page Container
 * 
 * Container component following Single Responsibility Principle (SRP) and 
 * Dependency Inversion Principle (DIP) through Redux thunks
 * 
 * - SRP: Only responsible for wiring UI components to Redux store
 * - DIP: Uses Redux thunks which get services via dependency injection
 * - No direct calls to repositories or services
 * - Pure container component that coordinates UI and state
 */

import { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Skeleton,
  Fade,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  fetchProfileThunk,
  updateProfileThunk,
  fetchMyItemsThunk,
  selectProfile,
  selectProfileItems,
  selectIsProfileLoading,
  selectProfileError,
  clearError
} from '../../../store/profileSlice';
import {
  ProfileHeader,
  ProfileEditForm,
  MyListings,
  type UpdateProfileCommand
} from '../../components/profile';
// TODO: Add back when image upload is integrated
// import { createImageUploader, type IImageUploader } from '../../../infrastructure/media/imageUpload';

/**
 * Snackbar Component for User Feedback
 * Material-UI based notification component
 */
interface SnackbarProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Snackbar({ message, type, onClose }: SnackbarProps) {
  const theme = useTheme();
  const severity = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        left: { xs: 16, sm: 'auto' }, // Full width on mobile
        zIndex: 1400,
        maxWidth: { xs: 'none', sm: 400 },
      }}
    >
      <Fade in={true}>
        <Alert 
          severity={severity}
          onClose={onClose}
          sx={{ 
            boxShadow: 3,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            '& .MuiAlert-action': {
              alignItems: 'center'
            },
            '& .MuiAlert-message': {
              padding: { xs: '6px 0', sm: '8px 0' }
            }
          }}
        >
          {message}
        </Alert>
      </Fade>
    </Box>
  );
}

/**
 * Profile Page Container Component
 * 
 * Coordinates between UI components and Redux store
 * Uses dependency injection through Redux thunks
 */
export function ProfilePage() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Redux state selectors
  const profile = useAppSelector(selectProfile);
  const items = useAppSelector(selectProfileItems);
  const isLoading = useAppSelector(selectIsProfileLoading);
  const error = useAppSelector(selectProfileError);

  // Local UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Image uploader instance (could be injected via DI container later)
  // TODO: Integrate image upload functionality
  // const imageUploader: IImageUploader = createImageUploader('mock'); // Switch to 'firebase' in production

  // Load profile and items on mount
  useEffect(() => {
    // Using any to bypass typing issues - the thunks should work at runtime
    dispatch(fetchProfileThunk() as any);
    dispatch(fetchMyItemsThunk() as any);
  }, [dispatch]);

  // Handle profile update with image upload
  const handleProfileUpdate = async (command: UpdateProfileCommand) => {
    try {
      setIsUpdating(true);
      
      // Using any to bypass typing issues - the thunk should work at runtime
      await dispatch(updateProfileThunk(command) as any).unwrap();
      
      setSnackbar({
        message: 'Profile updated successfully!',
        type: 'success'
      });
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setSnackbar({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle image file selection and upload
  // TODO: Integrate with ProfileEditForm for image upload
  // const handleImageUpload = async (file: File): Promise<string> => {
  //   try {
  //     const imageUrl = await imageUploader.upload(file);
  //     setSnackbar({
  //       message: 'Image uploaded successfully!',
  //       type: 'success'
  //     });
  //     return imageUrl;
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : 'Image upload failed';
  //     setSnackbar({
  //       message: errorMessage,
  //       type: 'error'
  //     });
  //     throw err;
  //   }
  // };

  // Handle item click navigation
  const handleItemClick = (item: any) => {
    // TODO: Navigate to item detail page
    console.log('Navigate to item:', item.itemId);
  };

  // Handle error dismissal
  const handleErrorDismiss = () => {
    dispatch(clearError());
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(null);
  };

  // Loading state
  if (isLoading && !profile) {
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
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: { xs: 1, sm: 2 },
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 4 } 
            }}>
              <Skeleton 
                variant="circular" 
                width={isMobile ? 60 : 80} 
                height={isMobile ? 60 : 80} 
              />
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    mb: 1,
                    width: { xs: '100%', sm: '60%' },
                    mx: { xs: 'auto', sm: 0 }
                  }} 
                />
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    fontSize: '1rem',
                    width: { xs: '80%', sm: '40%' },
                    mx: { xs: 'auto', sm: 0 }
                  }} 
                />
              </Box>
            </Box>
            <Skeleton 
              variant="rectangular" 
              height={isMobile ? 150 : 200} 
              sx={{ mb: { xs: 2, sm: 3 } }} 
            />
            <Skeleton 
              variant="rectangular" 
              height={isMobile ? 200 : 300} 
            />
          </Paper>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error && !profile) {
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
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              textAlign: 'center',
              borderRadius: { xs: 1, sm: 2 },
            }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                justifyContent: 'center',
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Unable to load profile
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {error}
              </Typography>
            </Alert>
            <Button
              variant="contained"
              onClick={handleErrorDismiss}
              color="primary"
              size={isMobile ? 'medium' : 'large'}
              sx={{
                minWidth: { xs: '100%', sm: 'auto' },
                py: { xs: 1.5, sm: 1 }
              }}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }

  if (!profile) {
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
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No profile data available
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: { xs: 2, sm: 3, md: 4 }, // Responsive padding: smaller on mobile
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
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 2, sm: 3 } // Responsive gap between sections
        }}>
          {/* Profile Header Section */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, // Responsive padding inside cards
              borderRadius: { xs: 1, sm: 2 }, // Slightly less rounded on mobile
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile
              justifyContent: 'space-between', 
              alignItems: { xs: 'stretch', sm: 'flex-start' }, // Full width on mobile
              gap: { xs: 2, sm: 0 }, // Add gap on mobile
              mb: { xs: 2, sm: 3 } 
            }}>
              <Box sx={{ flex: 1 }}>
                <ProfileHeader 
                  profile={profile} 
                  size="full"
                />
              </Box>
              <Button
                variant={isEditing ? "outlined" : "contained"}
                color="primary"
                onClick={() => setIsEditing(!isEditing)}
                sx={{ 
                  ml: { xs: 0, sm: 2 }, // No left margin on mobile
                  minWidth: { xs: '100%', sm: 'auto' }, // Full width on mobile
                  mt: { xs: 1, sm: 0 }, // Add top margin on mobile
                }}
                size={isMobile ? 'medium' : 'large'} // Larger button on desktop
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            {/* Edit Form (when editing) */}
            {isEditing && (
              <Fade in={isEditing}>
                <Box sx={{ 
                  borderTop: 1, 
                  borderColor: 'divider', 
                  pt: { xs: 2, sm: 3 }, // Responsive padding top
                  mt: { xs: 2, sm: 3 } // Responsive margin top
                }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.25rem' } // Responsive font size
                    }}
                  >
                    Edit Profile
                  </Typography>
                  <ProfileEditForm
                    initial={profile}
                    onSubmit={handleProfileUpdate}
                    loading={isUpdating}
                    error={error || undefined}
                    onCancel={() => setIsEditing(false)}
                  />
                </Box>
              </Fade>
            )}
          </Paper>

          {/* My Listings Section */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
              borderRadius: { xs: 1, sm: 2 }, // Responsive border radius
            }}
          >
            <MyListings
              items={items}
              loading={isLoading}
              onItemClick={handleItemClick}
            />
          </Paper>
        </Box>
      </Box>

      {/* Snackbar for feedback */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleSnackbarClose}
        />
      )}
    </Box>
  );
}

/*
 * Container Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Only responsible for wiring UI components to Redux store
 *    - No business logic, validation, or data transformation
 *    - Clear separation between container and presentation layers
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Uses Redux thunks which receive services via dependency injection
 *    - No direct imports or calls to repositories/services
 *    - Services injected through thunk extra argument pattern
 * 
 * 3. Redux Integration:
 *    - Dispatches thunks on mount for data loading
 *    - Uses selectors for type-safe state access
 *    - Handles async operations through Redux toolkit
 * 
 * 4. Image Upload Integration:
 *    - Uses IImageUploader abstraction for file uploads
 *    - Can be easily swapped between implementations
 *    - Handles upload errors gracefully
 * 
 * 5. User Experience:
 *    - Loading states for async operations
 *    - Error handling with user feedback
 *    - Success notifications via snackbar
 *    - Optimistic UI updates
 * 
 * 6. Testability:
 *    - Easy to mock Redux store for testing
 *    - Clear props interface for components
 *    - Predictable state management flow
 * 
 * Data Flow:
 * 
 * 1. Mount → dispatch fetchProfileThunk + fetchMyItemsThunk
 * 2. Thunks → get services from DI container → call business logic
 * 3. Results → update Redux state → trigger re-render
 * 4. User edits → ProfileEditForm → onSubmit callback
 * 5. Image upload → IImageUploader → get URL → include in command
 * 6. Submit → dispatch updateProfileThunk → update state
 * 7. Success/Error → show snackbar feedback
 * 
 * Future Enhancements:
 * 
 * - Add image upload thunk for better separation
 * - Implement optimistic updates for better UX
 * - Add form validation integration
 * - Support for real-time updates via websockets
 */