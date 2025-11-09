import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Stack,
  IconButton
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Sell as SellIcon,
  ArrowBack as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import type { AppDispatch } from '../../../store/store';
import {
  getItemThunk,
  addItemImagesThunk,
  uploadItemImagesThunk,
  markItemSoldThunk,
  clearError,
  selectCurrentItem,
  selectIsItemsLoading,
  selectItemsError
} from '../../../store/itemsSlice';
import { selectAuthUser } from '../../../store/authSlice';
import { canEditItem, canMarkSold, canModerate } from '../../../domain/auth/permissions';
import {
  adminDeleteItemThunk,
  adminBanUserThunk,
  clearAdminError,
  selectAdminIsLoading,
  selectAdminError
} from '../../../store/adminSlice';
import AdminActions from '../../components/admin/AdminActions';
import AddImagesDialog from '../../components/items/AddImagesDialog';
import { ItemDetailActionsContainer } from '../../components/items/ItemDetailActionsContainer';
import { getStatusLabel, getStatusColor, isItemSold } from '../../../utils/itemStatus';
import { ItemImage } from '../../components/common/ItemImage';

/**
 * Item Detail Page Container Component
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for displaying and managing single item details
 * - Coordinates between item data and user actions
 * - Handles owner-specific functionality
 * 
 * Container Pattern:
 * - Manages all side effects and state operations
 * - Handles item loading and action dispatching
 * - Orchestrates user interactions via Redux thunks
 */
const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state selectors
  const currentItem = useSelector(selectCurrentItem);
  const isLoading = useSelector(selectIsItemsLoading);
  const error = useSelector(selectItemsError);
  const currentUser = useSelector(selectAuthUser);
  const adminIsLoading = useSelector(selectAdminIsLoading);
  const adminError = useSelector(selectAdminError);
  
  // Local UI state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [showAddImagesDialog, setShowAddImagesDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debug: Log the current item to see if images are in Redux state
  useEffect(() => {
    if (currentItem) {
      console.log('🔍 Current item from Redux:', {
        itemId: currentItem.itemId,
        title: currentItem.title,
        images: currentItem.images,
        imageCount: currentItem.images?.length || 0
      });
    }
  }, [currentItem?.images]); // Re-run when images change

  // Debug: Log image gallery state
  useEffect(() => {
    if (currentItem) {
      const hasImages = currentItem.images && currentItem.images.length > 0;
      const currentImage = hasImages ? currentItem.images[currentImageIndex] : undefined;
      console.log('🖼️ Image gallery state:', {
        hasImages,
        currentImageIndex,
        currentImage,
        totalImages: currentItem.images?.length || 0,
        allImages: currentItem.images
      });
    }
  }, [currentItem, currentImageIndex]);

  // Reset image index when images change (e.g., after upload)
  useEffect(() => {
    if (currentItem?.images?.length && currentImageIndex >= currentItem.images.length) {
      console.log('🔄 Resetting image index:', { currentImageIndex, imageCount: currentItem.images.length });
      setCurrentImageIndex(0);
    }
  }, [currentItem?.images?.length, currentImageIndex]);

  /**
   * Display snackbar with message
   * Centralized feedback system following SRP
   */
  const showFeedback = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  /**
   * Handle navigation with feedback
   * Provides consistent navigation experience
   */
  const navigateWithDelay = (path: string, delay: number = 2000) => {
    setTimeout(() => {
      navigate(path);
    }, delay);
  };

  // Constants
  const CONDITIONS = {
    1: 'New',
    2: 'Like New', 
    3: 'Good',
    4: 'Fair',
    5: 'Poor'
  };

  /**
   * Load item data on component mount
   */
  useEffect(() => {
    if (!id) {
      console.error('ItemDetailPage: No ID parameter found in URL');
      return;
    }
    
    const itemId = parseInt(id, 10);
    if (isNaN(itemId) || itemId <= 0) {
      console.error('Invalid item ID:', id);
      return;
    }
    
    dispatch(clearError());
    dispatch(getItemThunk(itemId));
  }, [dispatch, id]);

  /**
   * Handle add images action
   */
  const handleAddImages = () => {
    setShowAddImagesDialog(true);
  };

  /**
   * Handle confirming image upload
   */
  const handleConfirmImages = async (files: File[]) => { // Changed parameter type
    if (!currentItem || files.length === 0) {
      setShowAddImagesDialog(false);
      return;
    }

    try {
      // Clear any previous errors before starting
      dispatch(clearError());
      
      console.log('🔍 Starting file upload with:', {
        itemId: currentItem.itemId,
        fileCount: files.length,
        fileNames: files.map(f => f.name)
      });

      const result = await dispatch(uploadItemImagesThunk({ // Use new thunk
        itemId: currentItem.itemId,
        files
      }));

      if (uploadItemImagesThunk.fulfilled.match(result)) {
        showFeedback('Images uploaded successfully!');
        
        // Refresh the item to show updated images
        dispatch(getItemThunk(currentItem.itemId));
      } else if (uploadItemImagesThunk.rejected.match(result)) {
        const errorMsg = result.error.message || 'Failed to upload images';
        console.error('❌ Upload failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
      console.error('❌ Upload error:', errorMessage);
      showFeedback(errorMessage, 'error');
    } finally {
      setShowAddImagesDialog(false);
    }
  };

  /**
   * Handle mark as sold action
   */
  const handleMarkSold = async () => {
    if (!currentItem) return;

    try {
      const result = await dispatch(markItemSoldThunk(currentItem.itemId));

      if (markItemSoldThunk.fulfilled.match(result)) {
        showFeedback('Item marked as sold! Buyers will see this update.');
        
        // Refresh the item to show updated status
        dispatch(getItemThunk(currentItem.itemId));
      } else if (markItemSoldThunk.rejected.match(result)) {
        throw new Error(result.error.message || 'Failed to mark item as sold');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark item as sold';
      showFeedback(errorMessage, 'error');
    }
  };

  /**
   * Handle admin delete item action
   */
  const handleAdminDeleteItem = async () => {
    if (!currentItem) return;

    // Confirm action with user
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETE\n\nAre you sure you want to permanently delete "${currentItem.title}"?\n\n• This action cannot be undone\n• The item will be removed from all listings\n• Users will no longer be able to view or contact about this item\n\nClick OK to proceed with deletion.`
    );
    
    if (!confirmed) return;

    try {
      const result = await dispatch(adminDeleteItemThunk(currentItem.itemId));

      if (adminDeleteItemThunk.fulfilled.match(result)) {
        showFeedback('Item deleted successfully! Redirecting to home...');
        navigateWithDelay('/');
      } else if (adminDeleteItemThunk.rejected.match(result)) {
        throw new Error(result.error.message || 'Failed to delete item');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      showFeedback(errorMessage, 'error');
    }
  };

  /**
   * Handle admin ban user action
   */
  const handleAdminBanUser = async (userId: number) => {
    if (!currentItem) return;

    // Confirm action with user
    const confirmed = window.confirm(
      `⚠️ BAN USER\n\nAre you sure you want to ban this user?\n\n• They will lose access to the platform immediately\n• All their active listings will be hidden\n• They cannot create new accounts with the same email\n• This action should only be used for serious violations\n\nClick OK to proceed with ban.`
    );
    
    if (!confirmed) return;

    try {
      const result = await dispatch(adminBanUserThunk(userId));

      if (adminBanUserThunk.fulfilled.match(result)) {
        showFeedback('User banned successfully! They can no longer access the platform.');
      } else if (adminBanUserThunk.rejected.match(result)) {
        throw new Error(result.error.message || 'Failed to ban user');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to ban user';
      showFeedback(errorMessage, 'error');
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigate(-1);
  };

  /**
   * Handle image navigation
   */
  const handlePreviousImage = () => {
    console.log('⬅️ Previous image clicked:', { currentIndex: currentImageIndex, totalImages: currentItem?.images?.length });
    setCurrentImageIndex(prev => {
      const newIndex = prev === 0 ? (currentItem?.images?.length || 1) - 1 : prev - 1;
      console.log('⬅️ New index:', newIndex);
      return newIndex;
    });
  };

  const handleNextImage = () => {
    console.log('➡️ Next image clicked:', { currentIndex: currentImageIndex, totalImages: currentItem?.images?.length });
    setCurrentImageIndex(prev => {
      const newIndex = prev === (currentItem?.images?.length || 1) - 1 ? 0 : prev + 1;
      console.log('➡️ New index:', newIndex);
      return newIndex;
    });
  };

  /**
   * Close snackbar and clear both item and admin errors
   */
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
    dispatch(clearError());
    dispatch(clearAdminError());
  };

  /**
   * Format price display
   */
  const formatPrice = (price?: number) => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  /**
   * Get status chip
   */
  const getStatusChip = () => {
    if (!currentItem) return null;
    
    return (
      <Chip 
        label={getStatusLabel(currentItem.statusId)} 
        color={getStatusColor(currentItem.statusId)} 
        size="medium" 
      />
    );
  };

  /**
   * Check permissions using domain logic
   */
  const userPermissions = React.useMemo(() => {
    if (!currentUser || !currentItem) {
      return {
        canEdit: false,
        canMarkSold: false,
        canViewActions: false,
        canModerateContent: false
      };
    }

    const userProfile = {
      userId: currentUser.userId,
      isAdmin: currentUser.isAdmin
    };

    const itemDetail = {
      itemId: currentItem.itemId,
      sellerId: currentItem.sellerId,
      statusId: currentItem.statusId
    };

    return {
      canEdit: canEditItem(userProfile, itemDetail),
      canMarkSold: canMarkSold(userProfile, itemDetail),
      canViewActions: canEditItem(userProfile, itemDetail), // Same as canEdit for now
      canModerateContent: canModerate(userProfile)
    };
  }, [currentUser, currentItem]);

  /**
   * Check if item is sold
   */
  const isSold = currentItem ? isItemSold(currentItem.statusId) : false;

  /**
   * Show admin error in snackbar if it exists
   * Provides centralized error feedback for admin operations
   */
  React.useEffect(() => {
    if (adminError) {
      showFeedback(`Admin operation failed: ${adminError}`, 'error');
    }
  }, [adminError]);

  if (isLoading || adminIsLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || adminError) {
    // Determine if this is a loading error vs operation error
    const isLoadingError = isLoading || adminIsLoading;
    const errorMessage = error || adminError;
    const errorTitle = isLoadingError ? "Failed to load item" : "Operation failed";
    
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {errorTitle}: {errorMessage}
        </Alert>
      </Container>
    );
  }

  if (!currentItem) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Item not found
        </Alert>
      </Container>
    );
  }

  const hasImages = currentItem.images && currentItem.images.length > 0;
  const currentImage = hasImages ? currentItem.images[currentImageIndex] : undefined;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
        color="inherit"
      >
        Back
      </Button>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Image Gallery */}
        <Box sx={{ flex: { md: 1 } }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <ItemImage
                src={currentImage}
                alt={currentItem.title}
                height={400}
                sx={{ 
                  borderRadius: 2
                }}
              />
              
              {/* Image Navigation */}
              {hasImages && currentItem.images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePreviousImage}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                  
                  {/* Image Counter */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    {currentImageIndex + 1} / {currentItem.images.length}
                  </Box>
                </>
              )}
            </Box>
            
            {/* Thumbnail Strip */}
            {hasImages && currentItem.images.length > 1 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, overflow: 'auto' }}>
                {currentItem.images.map((image, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    sx={{
                      minWidth: 80,
                      height: 80,
                      cursor: 'pointer',
                      border: index === currentImageIndex ? 2 : 1,
                      borderColor: index === currentImageIndex ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <ItemImage
                      src={image}
                      alt={`${currentItem.title} ${index + 1}`}
                      height="100%"
                      width="100%"
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* Item Details */}
        <Box sx={{ flex: { md: 1 } }}>
          <Stack spacing={3}>
            {/* Title and Status */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1, mr: 2 }}>
                  {currentItem.title}
                </Typography>
                {getStatusChip()}
              </Box>
              
              <Typography variant="h3" color="primary" gutterBottom>
                {formatPrice(currentItem.price)}
              </Typography>
            </Box>

            <Divider />

            {/* Item Details */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Item Details
              </Typography>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Condition:
                  </Typography>
                  <Typography variant="body2">
                    {CONDITIONS[currentItem.conditionId as keyof typeof CONDITIONS] || 'Unknown'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Posted:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(currentItem.postedDate).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Category:
                  </Typography>
                  <Typography variant="body2">
                    {currentItem.categoryName || 'Not specified'}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Description */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {currentItem.description}
              </Typography>
            </Box>

            <Divider />

            {/* Actions */}
            <Box>
              {/* Messaging Actions for All Users */}
              <ItemDetailActionsContainer item={currentItem} />
              
              {/* Owner-Specific Actions - Based on Permissions */}
              {userPermissions.canViewActions && (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={2}>
                    {/* Add Images Button */}
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCameraIcon />}
                      onClick={handleAddImages}
                      disabled={!userPermissions.canEdit}
                      sx={{ flex: 1 }}
                    >
                      Add Images
                    </Button>
                    
                    {/* Edit Button - Placeholder for future implementation */}
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      disabled={!userPermissions.canEdit}
                      sx={{ flex: 1 }}
                      onClick={() => {
                        // TODO: Navigate to edit page when implemented
                        console.log('Edit item:', currentItem.itemId);
                      }}
                    >
                      Edit
                    </Button>
                    
                    {/* Mark as Sold Button */}
                    <Button
                      variant="contained"
                      startIcon={<SellIcon />}
                      onClick={handleMarkSold}
                      disabled={!userPermissions.canMarkSold || isSold}
                      sx={{ flex: 1 }}
                    >
                      {isSold ? 'Sold' : 'Mark as Sold'}
                    </Button>
                  </Stack>
                </Box>
              )}

              {/* Admin Moderation Actions with Loading State */}
              {userPermissions.canModerateContent && (
                <Box sx={{ mt: 3 }}>
                  {adminIsLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Processing admin action...
                      </Typography>
                    </Box>
                  )}
                  <AdminActions
                    onDeleteItem={handleAdminDeleteItem}
                    onBanUser={handleAdminBanUser}
                    userId={currentItem.sellerId}
                    disabled={adminIsLoading}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Add Images Dialog */}
      <AddImagesDialog
        open={showAddImagesDialog}
        onClose={() => setShowAddImagesDialog(false)}
        onConfirm={handleConfirmImages}
        maxCount={4}
      />

      {/* Enhanced Success/Error Snackbar with improved UX */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={snackbarSeverity === 'error' ? 8000 : 6000} // Longer duration for errors
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: '350px'
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: '100%',
            fontSize: '0.95rem',
            alignItems: 'center',
            '& .MuiAlert-message': {
              paddingTop: '2px'
            },
            ...(snackbarSeverity === 'success' && {
              backgroundColor: 'success.main',
              color: 'success.contrastText'
            }),
            ...(snackbarSeverity === 'error' && {
              backgroundColor: 'error.main',
              color: 'error.contrastText'
            })
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ItemDetailPage;