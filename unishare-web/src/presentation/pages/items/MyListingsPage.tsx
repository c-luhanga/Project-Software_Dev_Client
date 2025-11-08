import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Sell as SellIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import type { AppDispatch } from '../../../store/store';
import {
  listMyItemsThunk,
  addItemImagesThunk,
  markItemSoldThunk,
  clearError,
  selectMyItems,
  selectIsItemsLoading,
  selectItemsError
} from '../../../store/itemsSlice';
import type { ItemSummary } from '../../../domain/items/contracts';
import AddImagesDialog from '../../components/items/AddImagesDialog';
import { ItemImage } from '../../components/common/ItemImage';

/**
 * My Listings Page Container Component
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for managing user's item listings
 * - Coordinates between Redux state and UI components
 * - Handles user actions via thunk dispatching
 * 
 * Container Pattern:
 * - Manages all side effects and state operations
 * - Delegates UI presentation to child components
 * - Orchestrates multiple user workflows
 */
const MyListingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state selectors
  const myItems = useSelector(selectMyItems);
  const isLoading = useSelector(selectIsItemsLoading);
  const error = useSelector(selectItemsError);
  
  // Local UI state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [showAddImagesDialog, setShowAddImagesDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<number | null>(null);

  /**
   * Load user's items on component mount
   */
  useEffect(() => {
    dispatch(listMyItemsThunk());
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Handle opening add images dialog
   */
  const handleAddImages = (itemId: number) => {
    setSelectedItemId(itemId);
    setShowAddImagesDialog(true);
    handleCloseMenu();
  };

  /**
   * Handle confirming image upload
   */
  const handleConfirmImages = async (imageUrls: string[]) => {
    if (!selectedItemId || imageUrls.length === 0) {
      setShowAddImagesDialog(false);
      return;
    }

    try {
      const result = await dispatch(addItemImagesThunk({
        itemId: selectedItemId,
        imageUrls
      }));

      if (addItemImagesThunk.fulfilled.match(result)) {
        setSnackbarMessage('Images added successfully!');
        setSnackbarSeverity('success');
        setShowSnackbar(true);
        
        // Refresh the listings to show updated images
        dispatch(listMyItemsThunk());
      } else if (addItemImagesThunk.rejected.match(result)) {
        throw new Error(result.error.message || 'Failed to add images');
      }
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to add images');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setShowAddImagesDialog(false);
      setSelectedItemId(null);
    }
  };

  /**
   * Handle marking item as sold
   */
  const handleMarkSold = async (itemId: number) => {
    try {
      const result = await dispatch(markItemSoldThunk(itemId));

      if (markItemSoldThunk.fulfilled.match(result)) {
        setSnackbarMessage('Item marked as sold!');
        setSnackbarSeverity('success');
        setShowSnackbar(true);
        
        // Refresh the listings to show updated status
        dispatch(listMyItemsThunk());
      } else if (markItemSoldThunk.rejected.match(result)) {
        throw new Error(result.error.message || 'Failed to mark item as sold');
      }
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to mark item as sold');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
    
    handleCloseMenu();
  };

  /**
   * Handle edit item (future implementation)
   */
  const handleEdit = (itemId: number) => {
    // TODO: Navigate to edit page or open edit dialog
    console.log('Edit item:', itemId);
    setSnackbarMessage('Edit functionality coming soon!');
    setSnackbarSeverity('success');
    setShowSnackbar(true);
    handleCloseMenu();
  };

  /**
   * Handle opening action menu
   */
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, itemId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };

  /**
   * Handle closing action menu
   */
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuItemId(null);
  };

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
    dispatch(clearError());
  };

  /**
   * Get status chip color and label
   */
  const getStatusChip = (item: ItemSummary) => {
    // Assuming statusId 2 means sold (this should match your backend logic)
    if (item.statusId === 2) {
      return <Chip label="Sold" color="error" size="small" />;
    }
    return <Chip label="Available" color="success" size="small" />;
  };

  /**
   * Format price display
   */
  const formatPrice = (price?: number) => {
    if (!price) return 'Price not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading && myItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && myItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load your listings: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Listings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your items for sale
        </Typography>
      </Box>

      {myItems.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'action.hover',
            borderRadius: 2
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No listings yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start selling by creating your first listing
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Create Your First Listing
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3
          }}
        >
          {myItems.map((item) => (
            <Card key={item.itemId} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <ItemImage
                src={item.thumbnailUrl}
                alt={item.title}
                height={200}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1, mr: 1 }}>
                    {item.title}
                  </Typography>
                  {getStatusChip(item)}
                </Box>
                
                <Typography variant="h5" color="primary" gutterBottom>
                  {formatPrice(item.price)}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {/* ItemSummary doesn't have description, show placeholder */}
                  No description available
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Posted {new Date(item.postedDate).toLocaleDateString()}
                </Typography>
                
                <IconButton
                  onClick={(e) => handleOpenMenu(e, item.itemId)}
                  size="small"
                  aria-label="Item actions"
                >
                  <MoreVertIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => menuItemId && handleAddImages(menuItemId)}>
          <PhotoCameraIcon sx={{ mr: 1 }} fontSize="small" />
          Add Images
        </MenuItem>
        
        <MenuItem 
          onClick={() => menuItemId && handleMarkSold(menuItemId)}
          disabled={myItems.find(item => item.itemId === menuItemId)?.statusId === 2}
        >
          <SellIcon sx={{ mr: 1 }} fontSize="small" />
          Mark as Sold
        </MenuItem>
        
        <MenuItem onClick={() => menuItemId && handleEdit(menuItemId)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit (Coming Soon)
        </MenuItem>
      </Menu>

      {/* Add Images Dialog */}
      <AddImagesDialog
        open={showAddImagesDialog}
        onClose={() => setShowAddImagesDialog(false)}
        onConfirm={handleConfirmImages}
        maxCount={4}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyListingsPage;