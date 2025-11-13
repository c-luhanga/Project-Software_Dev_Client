import React from 'react';
import { Paper, Typography, Box, Skeleton } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

/**
 * StatCard Component - Reusable statistics display card
 * 
 * Single Responsibility Principle (SRP):
 * - Only responsible for displaying a single statistic with title and value
 * - Handles loading states and optional icons
 * - Provides consistent styling for dashboard metrics
 * 
 * Open/Closed Principle (OCP):
 * - Can be extended with different icons and colors
 * - Supports custom styling via sx prop
 * - Easy to add new props without modifying existing functionality
 */

interface StatCardProps {
  /** The title/label for the statistic */
  title: string;
  
  /** The numeric value to display */
  value: number | string;
  
  /** Optional subtitle or description */
  subtitle?: string;
  
  /** Optional icon component to display */
  icon?: React.ReactNode;
  
  /** Loading state - shows skeleton when true */
  loading?: boolean;
  
  /** Error state - shows error message when provided */
  error?: string | null;
  
  /** Color theme for the card */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  
  /** Custom styles */
  sx?: SxProps<Theme>;
  
  /** Click handler for the entire card */
  onClick?: () => void;
  
  /** Format function for the value */
  formatValue?: (value: number | string) => string;
}

/**
 * StatCard component for displaying dashboard statistics
 * 
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Users"
 *   value={1234}
 *   subtitle="Registered accounts"
 *   icon={<PersonIcon />}
 *   color="primary"
 *   formatValue={(val) => val.toLocaleString()}
 * />
 * ```
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  loading = false,
  error = null,
  color = 'primary',
  sx = {},
  onClick,
  formatValue,
}) => {
  // Format the value if formatter is provided
  const displayValue = formatValue ? formatValue(value) : value;

  // Handle loading state
  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[4],
          } : {},
          ...sx,
        }}
        onClick={onClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          {icon && (
            <Box sx={{ mr: 2, opacity: 0.7 }}>
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
          )}
          <Skeleton variant="text" width="60%" height={32} />
        </Box>
        
        <Skeleton variant="text" width="40%" height={48} sx={{ mx: 'auto', mb: 1 }} />
        
        {subtitle && (
          <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
        )}
      </Paper>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: onClick ? 'pointer' : 'default',
          borderColor: 'error.main',
          borderWidth: 1,
          borderStyle: 'solid',
          bgcolor: 'error.light',
          ...sx,
        }}
        onClick={onClick}
      >
        <Typography variant="h6" color="error.main" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color="error.main">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        } : {},
        ...sx,
      }}
      onClick={onClick}
    >
      {/* Title and Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        {icon && (
          <Box 
            sx={{ 
              mr: 2, 
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
        )}
        <Typography 
          variant="h6" 
          component="h3"
          color="text.primary"
          fontWeight="medium"
        >
          {title}
        </Typography>
      </Box>
      
      {/* Value */}
      <Typography 
        variant="h3" 
        component="div"
        color={`${color}.main`}
        fontWeight="bold"
        sx={{ mb: subtitle ? 1 : 0 }}
      >
        {displayValue}
      </Typography>
      
      {/* Subtitle */}
      {subtitle && (
        <Typography 
          variant="body2" 
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

/**
 * Default number formatter for large numbers
 */
export const formatLargeNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(num)) return '0';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toLocaleString();
};

/**
 * Percentage formatter
 */
export const formatPercentage = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0%';
  
  return `${num.toFixed(1)}%`;
};

export default StatCard;