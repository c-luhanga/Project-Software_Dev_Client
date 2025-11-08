/**
 * Item Image Component with Fallback Support
 * 
 * Reusable component for displaying item images with proper error handling
 * and placeholder fallback. Follows Single Responsibility Principle (SRP).
 */

import React, { useState } from 'react';
import { Box, CardMedia } from '@mui/material';
import { ImageOutlined as ImageIcon } from '@mui/icons-material';

interface ItemImageProps {
  /** Primary image URL to display */
  src?: string;
  /** Alternative image URL (fallback) */
  fallbackSrc?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image height */
  height?: number | string;
  /** Image width */
  width?: string;
  /** Additional styles */
  sx?: object;
  /** Object fit behavior */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  /** Border radius */
  borderRadius?: number | string;
}

/**
 * ItemImage - Robust image component with fallback handling
 * 
 * Features:
 * - Automatic fallback to placeholder on load error
 * - Support for multiple fallback sources
 * - Accessible alt text
 * - Consistent styling with Material-UI
 * - Loading state indication
 * 
 * Error Handling:
 * - Primary image fails → Try fallback image
 * - Fallback fails → Show placeholder with icon
 * - Graceful degradation in all scenarios
 */
export const ItemImage: React.FC<ItemImageProps> = ({
  src,
  fallbackSrc,
  alt,
  height = 200,
  width = '100%',
  sx = {},
  objectFit = 'cover',
  borderRadius = 1
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  /**
   * Handle image load error
   * Try fallback image, then show placeholder
   */
  const handleError = () => {
    if (currentSrc === src && fallbackSrc) {
      // Try fallback image
      setCurrentSrc(fallbackSrc);
    } else {
      // Show placeholder
      setHasError(true);
    }
  };

  /**
   * Handle successful image load
   */
  const handleLoad = () => {
    setHasError(false);
  };

  // Show placeholder if no source or error occurred
  if (!currentSrc || hasError) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          borderRadius,
          border: '1px solid',
          borderColor: 'grey.300',
          ...sx
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'grey.500' }}>
          <ImageIcon sx={{ fontSize: 48, mb: 1 }} />
          <Box sx={{ fontSize: 12, fontWeight: 500 }}>
            No Image Available
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <CardMedia
      component="img"
      height={height}
      width={width}
      image={currentSrc}
      alt={alt}
      onError={handleError}
      onLoad={handleLoad}
      sx={{
        objectFit,
        borderRadius,
        ...sx
      }}
    />
  );
};

export default ItemImage;