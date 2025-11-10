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
  CircularProgress
} from '@mui/material';
import type { AppDispatch } from '../../../store/store';
import {
  createItemThunk, 
  uploadItemImagesThunk,
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
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  /**
   * Handle form submission
   * Creates item via thunk and manages subsequent workflow
   */
  const handleFormSubmit = async (command: CreateItemCommand, images?: File[]) => {
    try {
      console.log('🔍 SellItemPage - Starting form submission:', { command, imageCount: images?.length });
      
      // Check authentication status before attempting to create item
      const authState = (window as any).store?.getState?.()?.auth;
      console.log('🔐 Current auth state:', {
        hasToken: !!authState?.token,
        hasUser: !!authState?.user,
        userEmail: authState?.user?.email,
        status: authState?.status
      });
      
      const result = await dispatch(createItemThunk(command));
      
      console.log('🔍 SellItemPage - Create item result:', result);
      
      if (createItemThunk.fulfilled.match(result)) {
        const newItemId = result.payload;
        console.log('✅ SellItemPage - Item created successfully with ID:', newItemId);
        
        // If images were provided, upload them immediately
        if (images && images.length > 0) {
          try {
            console.log('🔍 SellItemPage - Uploading images for item:', newItemId);
            const uploadResult = await dispatch(uploadItemImagesThunk({ 
              itemId: newItemId, 
              files: images 
            }));
            
            if (uploadItemImagesThunk.fulfilled.match(uploadResult)) {
              console.log('✅ SellItemPage - Images uploaded successfully');
              setSnackbarMessage('Item created and images uploaded successfully!');
              setSnackbarSeverity('success');
              setShowSnackbar(true);
              
              // Navigate directly to the item
              setTimeout(() => navigate(`/items/${newItemId}`), 1500);
            } else {
              console.warn('⚠️ SellItemPage - Image upload failed');
              setSnackbarMessage('Item created but image upload failed');
              setSnackbarSeverity('warning');
              setShowSnackbar(true);
              setTimeout(() => navigate(`/items/${newItemId}`), 1500);
            }
          } catch (error) {
            console.error('❌ SellItemPage - Image upload error:', error);
            setSnackbarMessage('Item created but image upload failed');
            setSnackbarSeverity('warning');
            setShowSnackbar(true);
            setTimeout(() => navigate(`/items/${newItemId}`), 1500);
          }
        } else {
          // No images provided, show success and navigate
          console.log('✅ SellItemPage - No images to upload, navigating to item');
          setSnackbarMessage('Item created successfully!');
          setSnackbarSeverity('success');
          setShowSnackbar(true);
          setTimeout(() => navigate(`/items/${newItemId}`), 1500);
        }
      } else if (createItemThunk.rejected.match(result)) {
        console.error('❌ SellItemPage - Item creation rejected:', result.error);
        
        // Extract detailed error information
        const errorDetails = {
          message: result.error.message,
          name: result.error.name,
          code: (result.error as any).code,
          stack: result.error.stack
        };
        console.error('❌ SellItemPage - Error details:', errorDetails);
        
        // Show user-friendly error message
        let userMessage = 'Failed to create item';
        if (result.error.message) {
          if (result.error.message.includes('401') || result.error.message.includes('Unauthorized')) {
            userMessage = 'Please log in to create items';
          } else if (result.error.message.includes('403') || result.error.message.includes('Forbidden')) {
            userMessage = 'You must use a @principia.edu email to create items';
          } else if (result.error.message.includes('400') || result.error.message.includes('validation')) {
            userMessage = 'Please check all required fields and try again';
          } else {
            userMessage = result.error.message;
          }
        }
        
        throw new Error(userMessage);
      } else {
        console.error('❌ SellItemPage - Unexpected result type:', result);
        throw new Error('Unexpected response from item creation');
      }
    } catch (error) {
      console.error('❌ SellItemPage - Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
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
          Fill out the form below to list your item for sale. Add photos to make your listing more attractive to buyers.
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