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
import { useNavigate } from 'react-router-dom';
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
  selectProfile,
  selectIsProfileLoading,
  selectProfileError,
  selectIsUpdating,
  selectUpdateError,
  selectLastUpdatedAt,
  selectUpdateSucceeded,
  clearError,
  clearUpdateError
} from '../../../store/profileSlice';
import {
  listMyItemsThunk,
  selectMyItems,
  selectIsItemsLoading
} from '../../../store/itemsSlice';
import {
  ProfileHeader,
  ProfileEditForm,
  MyListings
} from '../../components/profile';
import type { UpdateProfileCommand } from '../../../domain/user/contracts';
import { createImageUploader, type IImageUploader } from '../../../infrastructure/media/imageUpload';

/**
 * Enhanced Snackbar Component for User Feedback (SRP, UX)
 * Material-UI based notification component with accessibility features
 */
interface SnackbarProps {
  message: string;
  type: 'success' | 'error' | 'info';
  open: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

function AccessibleSnackbar({ 
  message, 
  type, 
  open, 
  onClose, 
  autoHideDuration = 6000 
}: SnackbarProps) {
  const severity = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';

  // Auto-hide functionality
  useEffect(() => {
    if (open && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

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
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <Fade in={open}>
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
          aria-describedby="snackbar-message"
        >
          <span id="snackbar-message">{message}</span>
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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Redux state selectors
  const profile = useAppSelector(selectProfile);
  const items = useAppSelector(selectMyItems);
  const isLoading = useAppSelector(selectIsProfileLoading);
  const isItemsLoading = useAppSelector(selectIsItemsLoading);
  const error = useAppSelector(selectProfileError);
  const isUpdating = useAppSelector(selectIsUpdating);
  const updateError = useAppSelector(selectUpdateError);
  const lastUpdatedAt = useAppSelector(selectLastUpdatedAt);
  const updateSucceeded = useAppSelector(selectUpdateSucceeded);

  // Local UI state
  const [isEditing, setIsEditing] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    phone?: string;
    house?: string;
    profileImageUrl?: string;
  }>({});
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    open: boolean;
  }>({ message: '', type: 'info', open: false });

  // Track last update time for success notifications
  const [prevLastUpdatedAt, setPrevLastUpdatedAt] = useState<number | undefined>(lastUpdatedAt);

  // Image uploader instance - simple container pattern
  const imageUploader: IImageUploader = createImageUploader('mock', {
    useFakeCdn: import.meta.env.DEV // Use Vite's environment detection
  });

  // Load profile and items on mount (SRP, DIP via thunks)
  useEffect(() => {
    dispatch(fetchProfileThunk());
    dispatch(listMyItemsThunk());
  }, [dispatch]);

  // Watch for successful profile updates (UX: Success notifications)
  useEffect(() => {
    // Show success notification when lastUpdatedAt changes (profile update succeeded)
    if (lastUpdatedAt && lastUpdatedAt !== prevLastUpdatedAt && updateSucceeded) {
      setSnackbar({
        message: 'Profile updated successfully!',
        type: 'success',
        open: true
      });
      setIsEditing(false);
      setPendingImageUrl(null);
      setFieldErrors({});
      setPrevLastUpdatedAt(lastUpdatedAt);
    }
  }, [lastUpdatedAt, prevLastUpdatedAt, updateSucceeded]);

  // Watch for update errors (UX: Error notifications)
  useEffect(() => {
    // Show error notification when update fails
    if (updateError) {
      setSnackbar({
        message: updateError,
        type: 'error',
        open: true
      });
    }
  }, [updateError]);

  // Handle image file selection and upload (DIP via IImageUploader)
  const handlePickImage = async (file: File) => {
    try {
      setFieldErrors(prev => ({ ...prev, profileImageUrl: undefined }));
      
      // Call IImageUploader.upload(file) - resolved via simple container
      const imageUrl = await imageUploader.upload(file);
      
      // Set local pendingImageUrl for merge with form data
      setPendingImageUrl(imageUrl);
      
      setSnackbar({
        message: 'Image uploaded successfully!',
        type: 'success',
        open: true
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Image upload failed';
      setFieldErrors(prev => ({
        ...prev,
        profileImageUrl: errorMessage
      }));
      setSnackbar({
        message: errorMessage,
        type: 'error',
        open: true
      });
    }
  };

  // Handle profile update - merge local edits + pendingImageUrl
  const handleProfileUpdate = async (command: UpdateProfileCommand) => {
    try {
      setFieldErrors({});
      
      // Merge local edits + pendingImageUrl into UpdateProfileCommand
      const mergedCommand: UpdateProfileCommand = {
        ...command,
        ...(pendingImageUrl && { profileImageUrl: pendingImageUrl })
      };
      
      // Dispatch updateProfileThunk (DIP via thunk)
      // Success/Error notifications are handled by Redux state watchers
      await dispatch(updateProfileThunk(mergedCommand)).unwrap();
      
      // No manual success notification - handled by useEffect watching lastUpdatedAt
    } catch (err) {
      // Error notification is handled by useEffect watching updateError
      // This catch is mainly for unwrap() promise rejection handling
      console.error('Profile update failed:', err);
    }
  };

  // Handle item click navigation
  const handleItemClick = (item: any) => {
    // Navigate to item detail page
    navigate(`/items/${item.itemId}`);
  };

  // Handle add new item navigation
  const handleAddItem = () => {
    navigate('/items/sell');
  };

  // Handle error dismissal
  const handleErrorDismiss = () => {
    dispatch(clearError());
    dispatch(clearUpdateError());
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
    // Clear update error when snackbar is closed
    if (updateError) {
      dispatch(clearUpdateError());
    }
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
                    onPickImage={handlePickImage}
                    loading={isUpdating}
                    error={updateError || undefined}
                    errors={fieldErrors}
                    onCancel={() => {
                      setIsEditing(false);
                      setPendingImageUrl(null);
                      setFieldErrors({});
                    }}
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
              loading={isItemsLoading}
              onItemClick={handleItemClick}
              onAddItem={handleAddItem}
            />
          </Paper>
        </Box>
      </Box>

      {/* Enhanced Snackbar for feedback */}
      <AccessibleSnackbar
        message={snackbar.message}
        type={snackbar.type}
        open={snackbar.open}
        onClose={handleSnackbarClose}
        autoHideDuration={snackbar.type === 'error' ? 8000 : 6000} // Longer for errors
      />
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
 *    - No direct imports or calls to repositories/services in thunks
 *    - Image uploader resolved via simple container pattern
 *    - All service access through thunks (SRP, DIP via thunks)
 * 
 * 3. Enhanced Container Wiring:
 *    - On mount: dispatches fetchProfileThunk and fetchMyItemsThunk
 *    - onPickImage(file): calls IImageUploader.upload(file), sets pendingImageUrl
 *    - On Save: merges local edits + pendingImageUrl, dispatches updateProfileThunk
 *    - Success/Error: shows Snackbar feedback with proper state management
 * 
 * 4. Image Upload Integration (DIP):
 *    - Uses IImageUploader abstraction for file uploads
 *    - Resolved via simple container/factory pattern
 *    - Can be easily swapped between mock/Firebase implementations
 *    - Handles upload errors with field-level feedback
 * 
 * 5. Enhanced User Experience (UX):
 *    - Redux state-driven notifications (success when lastUpdatedAt changes)
 *    - Error notifications from Redux updateError state
 *    - Auto-hiding Snackbars with accessibility features (aria-live, aria-atomic)
 *    - Longer duration for error messages (8s vs 6s for success)
 *    - Proper state cleanup on success operations
 * 
 * 6. Testability:
 *    - Easy to mock Redux store for testing
 *    - Clear props interface for components
 *    - Predictable state management flow
 *    - Image uploader can be mocked via DI
 * 
 * Enhanced Notification System (UX, SRP):
 * 
 * 1. Success Notifications:
 *    - Triggered by Redux state change (lastUpdatedAt + updateSucceeded)
 *    - Shows "Profile updated successfully" when updateProfileThunk fulfilled
 *    - Automatically closes edit form and cleans up pending state
 * 
 * 2. Error Notifications:
 *    - Triggered by Redux updateError state changes
 *    - Uses slice error for consistent error messaging
 *    - Longer auto-hide duration for better readability
 * 
 * 3. Accessibility Features:
 *    - aria-live="assertive" for errors, "polite" for success
 *    - aria-atomic="true" for complete message reading
 *    - aria-describedby for screen reader association
 *    - Proper role="status" for notifications
 * 
 * 4. Auto-Hide Behavior:
 *    - 6 seconds for success messages
 *    - 8 seconds for error messages (more time to read)
 *    - Manual close available via close button
 *    - Automatic cleanup of Redux error state on close
 * 
 * 1. Mount → dispatch fetchProfileThunk + fetchMyItemsThunk
 * 2. Thunks → get services from DI container → call business logic
 * 3. Results → update Redux state → trigger re-render
 * 4. User picks image → onPickImage → IImageUploader.upload → pendingImageUrl
 * 5. User edits form → ProfileEditForm → local state changes
 * 6. Submit → merge edits + pendingImageUrl → dispatch updateProfileThunk
 * 7. Success/Error → show snackbar feedback → cleanup state
 * 
 * Service Access Pattern:
 * - ✅ All service access through Redux thunks (maintains DIP)
 * - ✅ No direct repository imports in container
 * - ✅ Image uploader resolved via simple container pattern
 * - ✅ Clean separation between infrastructure and presentation
 * 
 * Future Enhancements:
 * - Add image upload thunk for better separation
 * - Implement optimistic updates for better UX
 * - Support for real-time updates via websockets
 * - Enhanced validation integration with domain layer
 */