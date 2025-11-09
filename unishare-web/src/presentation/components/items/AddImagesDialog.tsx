import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  Alert,
  Stack
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

/**
 * Props for AddImagesDialog component
 */
interface AddImagesDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when user confirms selected images - receives array of File objects */
  onConfirm: (files: File[]) => void;
  /** Maximum number of images allowed (default: 4) */
  maxCount?: number;
}

/**
 * Presentational dialog component for image selection
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for UI presentation and image preview
 * - Delegates upload/processing to parent container
 * - Pure presentational component with no business logic
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Depends on callback abstractions, not concrete implementations
 * - No direct file upload or storage dependencies
 * - Container handles actual upload/processing logic
 */
const AddImagesDialog: React.FC<AddImagesDialogProps> = ({
  open,
  onClose,
  onConfirm,
  maxCount = 4
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = maxCount - selectedFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      // Create preview URLs for selected files
      const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
      
      setSelectedFiles(prev => [...prev, ...filesToAdd]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }

    // Clear the input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Remove selected image by index
   */
  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle dialog close - cleanup preview URLs
   */
  const handleClose = () => {
    // Cleanup preview URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    onClose();
  };

  /**
   * Handle confirm - send files to parent for upload
   */
  const handleConfirm = () => {
    // Pass actual files for upload, not preview URLs
    console.log('📤 Confirming files:', selectedFiles.map(f => ({ name: f.name, size: f.size })));
    onConfirm(selectedFiles); // Pass files instead of URLs
    
    // Reset state after confirmation
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  /**
   * Trigger file input click
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const remainingSlots = maxCount - selectedFiles.length;
  const hasImages = selectedFiles.length > 0;
  const isMaxReached = selectedFiles.length >= maxCount;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="add-images-dialog-title"
    >
      <DialogTitle id="add-images-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoCameraIcon />
          Add Photos to Your Listing
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Instructions */}
          <Typography variant="body2" color="text.secondary">
            Add up to {maxCount} photos to help buyers see your item better. 
            Good photos can help your item sell faster!
          </Typography>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            aria-label="Select image files"
          />

          {/* Select Button */}
          {!isMaxReached && (
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={handleSelectClick}
              sx={{ alignSelf: 'flex-start' }}
            >
              Select Images ({remainingSlots} remaining)
            </Button>
          )}

          {/* Max limit warning */}
          {isMaxReached && (
            <Alert severity="info">
              Maximum of {maxCount} images reached. Remove an image to add a different one.
            </Alert>
          )}

          {/* Selected Images Preview */}
          {hasImages && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Images ({selectedFiles.length}/{maxCount})
              </Typography>
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)'
                  },
                  gap: 2
                }}
              >
                {previewUrls.map((url, index) => (
                  <Card key={index} sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={url}
                      alt={`Preview ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    {/* Remove button */}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Empty state */}
          {!hasImages && (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: 'action.hover',
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No images selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Select Images" to choose photos from your device
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!hasImages}
        >
          Add {selectedFiles.length} Photo{selectedFiles.length !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddImagesDialog;