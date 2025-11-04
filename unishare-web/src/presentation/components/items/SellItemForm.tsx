import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import type { CreateItemCommand } from '../../../domain/items/contracts';

/**
 * Props for SellItemForm component
 */
interface SellItemFormProps {
  onSubmit: (command: CreateItemCommand) => void;
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

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle input changes
   */
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
    const value = event.target.value as string;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
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

    const command: CreateItemCommand = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      categoryId: parseInt(formData.categoryId),
      price: parseFloat(formData.price),
      conditionId: parseInt(formData.conditionId)
    };

    onSubmit(command);
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
            <InputLabel>Category *</InputLabel>
            <Select
              value={formData.categoryId}
              onChange={handleChange('categoryId')}
              label="Category *"
            >
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
            label="Price"
            value={formData.price}
            onChange={handleChange('price')}
            error={!!errors.price}
            helperText={errors.price}
            disabled={disabled}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              step: 0.01
            }}
          />
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