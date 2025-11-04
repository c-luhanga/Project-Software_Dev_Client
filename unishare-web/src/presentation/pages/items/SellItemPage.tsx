import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import type { AppDispatch } from '../../../store/store';
import { 
  createItemThunk, 
  addItemImagesThunk,
  clearError,
  selectIsItemsLoading
} from '../../../store/itemsSlice';
import type { CreateItemCommand } from '../../../domain/items/contracts';
import SellItemForm from '../../components/items/SellItemForm';

/**
 * Sell Item Page Container Component
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for orchestrating item creation flow
 * - Delegates form rendering to SellItemForm component
 * - Handles navigation and user feedback
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Uses Redux thunks for all side effects
 * - No direct repository or service imports
 * - Depends on abstractions via dispatch/selector pattern
 * 
 * Container Pattern:
 * - Manages state and side effects
 * - Coordinates between multiple UI components
 * - Handles complex user workflows
 */
const SellItemPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state selectors
  const isLoading = useSelector(selectIsItemsLoading);
  
  // Local UI state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  /**
   * Handle form submission
   * Creates item via thunk and manages subsequent workflow
   */
  const handleFormSubmit = async (command: CreateItemCommand) => {
    try {
      const result = await dispatch(createItemThunk(command));
      
      if (createItemThunk.fulfilled.match(result)) {
        const newItemId = result.payload;
        setCreatedItemId(newItemId);
        setSnackbarMessage('Item created successfully!');
        setSnackbarSeverity('success');
        setShowSnackbar(true);
        
        // Prompt for optional image upload
        setShowImageUploadDialog(true);
      } else if (createItemThunk.rejected.match(result)) {
        throw new Error(result.error.message || 'Failed to create item');
      }
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to create item');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  /**
   * Handle image upload confirmation
   */
  const handleImageUpload = async () => {
    if (!createdItemId || imageFiles.length === 0) {
      handleNavigateToItem();
      return;
    }

    try {
      // Convert files to URLs (in real app, upload to storage first)
      const imageUrls = imageFiles.map(file => URL.createObjectURL(file));
      
      const result = await dispatch(addItemImagesThunk({
        itemId: createdItemId,
        imageUrls
      }));

      if (addItemImagesThunk.fulfilled.match(result)) {
        setSnackbarMessage('Images uploaded successfully!');
        setSnackbarSeverity('success');
        setShowSnackbar(true);
      } else if (addItemImagesThunk.rejected.match(result)) {
        setSnackbarMessage('Images upload failed, but item was created');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage('Images upload failed, but item was created');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      handleNavigateToItem();
    }
  };

  /**
   * Navigate to the newly created item detail page
   */
  const handleNavigateToItem = () => {
    setShowImageUploadDialog(false);
    if (createdItemId) {
      navigate(`/items/${createdItemId}`);
    } else {
      navigate('/items');
    }
  };

  /**
   * Skip image upload and navigate directly
   */
  const handleSkipImages = () => {
    handleNavigateToItem();
  };

  /**
   * Handle file selection for image upload
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImageFiles(files);
  };

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
    dispatch(clearError());
  };

  /**
   * Clear error on component mount
   */
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sell Your Item
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Fill out the form below to list your item for sale. You'll be able to add photos after creating the listing.
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Loading overlay */}
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {/* Sell Item Form */}
          <SellItemForm
            onSubmit={handleFormSubmit}
            disabled={isLoading}
          />
        </Box>
      </Paper>

      {/* Image Upload Dialog */}
      <Dialog
        open={showImageUploadDialog}
        onClose={handleSkipImages}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Photos (Optional)
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Would you like to add photos to your listing? Photos help buyers see your item better.
          </Typography>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ width: '100%', marginBottom: '16px' }}
          />
          
          {imageFiles.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {imageFiles.length} file(s) selected
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkipImages} color="inherit">
            Skip Photos
          </Button>
          <Button 
            onClick={handleImageUpload} 
            variant="contained"
            disabled={imageFiles.length === 0}
          >
            Upload Photos
          </Button>
        </DialogActions>
      </Dialog>

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

export default SellItemPage;