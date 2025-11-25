import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Stack,
  Typography,
  Paper,
  IconButton,
  Card,
  CardMedia,
  Alert
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import type { CreateItemCommand } from '../../../domain/items/contracts';

/**
 * Props for SellItemForm component
 */
interface SellItemFormProps {
  onSubmit: (command: CreateItemCommand, images?: File[]) => void;
  disabled?: boolean;
}

/**
 * Form component for creating new items
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for form UI and validation
 * - Delegates business logic to parent container
 * - Pure presentation component with controlled inputs
 */
const SellItemForm: React.FC<SellItemFormProps> = ({ onSubmit, disabled = false }) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    conditionId: ''
  });

  // Image upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle input changes
   */
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
    const value = event.target.value as string;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle image file selection
   */
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    // Limit to 4 images total
    const newImages = [...selectedImages, ...validFiles].slice(0, 4);
    setSelectedImages(newImages);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Remove selected image
   */
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Category is optional - only validate if provided
    if (formData.categoryId && isNaN(parseInt(formData.categoryId))) {
      newErrors.categoryId = 'Please select a valid category';
    }

    // Price is optional - only validate if provided
    if (formData.price) {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    if (!formData.conditionId) {
      newErrors.conditionId = 'Condition is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Parse and validate form data
    const categoryId = formData.categoryId ? parseInt(formData.categoryId) : undefined;
    const price = formData.price ? parseFloat(formData.price) : undefined;
    const conditionId = parseInt(formData.conditionId);

    console.log('🔍 Form submission data:', {
      title: formData.title.trim(),
      description: formData.description.trim(),
      categoryId: categoryId,
      price: price,
      conditionId: conditionId,
      hasImages: selectedImages.length > 0
    });

    // Validate parsed values
    if (isNaN(conditionId) || conditionId < 1 || conditionId > 5) {
      console.error('❌ Invalid condition ID:', conditionId);
      return;
    }

    if (categoryId !== undefined && (isNaN(categoryId) || categoryId < 1)) {
      console.error('❌ Invalid category ID:', categoryId);
      return;
    }

    if (price !== undefined && (isNaN(price) || price < 0)) {
      console.error('❌ Invalid price:', price);
      return;
    }

    const command: CreateItemCommand = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      conditionId: conditionId,
      ...(categoryId && { categoryId }),
      ...(price && { price })
    };

    console.log('✅ Final command:', command);
    onSubmit(command, selectedImages.length > 0 ? selectedImages : undefined);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        {/* Title */}
        <TextField
          fullWidth
          label="Item Title"
          value={formData.title}
          onChange={handleChange('title')}
          error={!!errors.title}
          helperText={errors.title}
          disabled={disabled}
          required
          placeholder="e.g., MacBook Pro 2023, iPhone 14, Textbook"
        />

        {/* Description */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          error={!!errors.description}
          helperText={errors.description}
          disabled={disabled}
          required
          placeholder="Describe your item's condition, features, and any important details..."
        />

        {/* Category and Condition */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <FormControl fullWidth error={!!errors.categoryId} disabled={disabled}>
            <InputLabel>Category (Optional)</InputLabel>
            <Select
              value={formData.categoryId}
              onChange={handleChange('categoryId')}
              label="Category (Optional)"
            >
              <MenuItem value="">
                <em>No Category</em>
              </MenuItem>
              <MenuItem value={1}>Electronics</MenuItem>
              <MenuItem value={2}>Books</MenuItem>
              <MenuItem value={3}>Clothing</MenuItem>
              <MenuItem value={4}>Furniture</MenuItem>
              <MenuItem value={5}>Sports & Recreation</MenuItem>
              <MenuItem value={6}>Other</MenuItem>
            </Select>
            {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth error={!!errors.conditionId} disabled={disabled}>
            <InputLabel>Condition *</InputLabel>
            <Select
              value={formData.conditionId}
              onChange={handleChange('conditionId')}
              label="Condition *"
            >
              <MenuItem value={1}>New</MenuItem>
              <MenuItem value={2}>Like New</MenuItem>
              <MenuItem value={3}>Good</MenuItem>
              <MenuItem value={4}>Fair</MenuItem>
              <MenuItem value={5}>Poor</MenuItem>
            </Select>
            {errors.conditionId && <FormHelperText>{errors.conditionId}</FormHelperText>}
          </FormControl>
        </Box>

        {/* Price */}
        <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
          <TextField
            fullWidth
            type="number"
            label="Price (Optional)"
            value={formData.price}
            onChange={handleChange('price')}
            error={!!errors.price}
            helperText={errors.price || "Leave empty if item is free"}
            disabled={disabled}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              step: 0.01
            }}
            placeholder="0.00"
          />
        </Box>

        {/* Image Upload Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Photos (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add up to 4 photos to showcase your item. First photo will be the main image.
          </Typography>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
            disabled={disabled}
          />
          
          {/* Upload area */}
          <Paper
            sx={{
              border: '2px dashed',
              borderColor: 'primary.light',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
              '&:hover': {
                borderColor: disabled ? 'primary.light' : 'primary.main',
                backgroundColor: disabled ? 'action.disabledBackground' : 'action.hover'
              }
            }}
            onClick={disabled ? undefined : handleUploadClick}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              {selectedImages.length === 0 
                ? 'Click to select photos or drag and drop' 
                : `${selectedImages.length}/4 photos selected`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports JPG, PNG up to 5MB each
            </Typography>
          </Paper>

          {/* Image previews */}
          {selectedImages.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Selected Photos:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedImages.map((file, index) => (
                  <Card key={index} sx={{ width: 100, height: 100, position: 'relative' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      image={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                      }}
                      onClick={() => handleRemoveImage(index)}
                      disabled={disabled}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    {index === 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(25,118,210,0.9)',
                          color: 'white',
                          textAlign: 'center',
                          fontSize: '0.7rem',
                          py: 0.5
                        }}
                      >
                        Main
                      </Box>
                    )}
                  </Card>
                ))}
              </Box>
              {selectedImages.length < 4 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PhotoCameraIcon />}
                  onClick={handleUploadClick}
                  disabled={disabled}
                  sx={{ mt: 1 }}
                >
                  Add More Photos ({selectedImages.length}/4)
                </Button>
              )}
            </Box>
          )}

          {/* Image upload tips */}
          {selectedImages.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Tips for great photos:</strong>
                <br />• Use good lighting and clear focus
                <br />• Show the item from multiple angles  
                <br />• Include any defects or wear
                <br />• First photo will be the main thumbnail
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={disabled}
            sx={{ minWidth: 150 }}
          >
            Create Listing
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default SellItemForm;