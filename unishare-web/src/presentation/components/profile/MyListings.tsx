/**
 * My Listings Component
 * 
 * Presentational component following Single Responsibility Principle (SRP)
 * - Single responsibility: Display user's items in a grid layout
 * - No business logic or external dependencies
 * - No Redux access or HTTP calls
 * - Pure UI component with props interface
 */

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Button,
  Skeleton,
  Stack
} from '@mui/material';
import { Add as AddIcon, Image as ImageIcon } from '@mui/icons-material';
import type { ItemSummary } from '../../../domain/items/contracts';
import { getStatusLabel, getStatusColor } from '../../../utils/itemStatus';

/**
 * My Listings props following Interface Segregation Principle (ISP)
 * Clean interface with only required data for display
 */
interface MyListingsProps {
  /** User's items to display */
  items: ItemSummary[];
  /** Loading state */
  loading: boolean;
  /** Optional click handler for items */
  onItemClick?: (item: ItemSummary) => void;
  /** Optional handler for adding new item */
  onAddItem?: () => void;
  /** Custom grid className */
  className?: string;
}

/**
 * Item Card props following ISP
 * Focused interface for individual item display
 */
interface ItemCardProps {
  item: ItemSummary;
  onClick?: (item: ItemSummary) => void;
}

/**
 * Status Badge Component
 * Displays item status with appropriate styling using proper status utilities
 */
function StatusBadge({ statusId }: { statusId: number }) {
  const label = getStatusLabel(statusId);
  const color = getStatusColor(statusId);

  return (
    <Chip 
      label={label} 
      color={color}
      size="small"
      sx={{ 
        fontWeight: 'medium',
        fontSize: '0.75rem'
      }}
    />
  );
}

/**
 * Item Card Component
 * Individual item display with thumbnail, title, price, and status
 */
function ItemCard({ item, onClick }: ItemCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3
        } : {}
      }}
    >
      <CardActionArea 
        onClick={handleClick}
        disabled={!onClick}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {/* Thumbnail */}
        <CardMedia
          sx={{
            height: 200,
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {item.thumbnailUrl ? (
            <Box
              component="img"
              src={item.thumbnailUrl}
              alt={item.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'grey.400' }}>
                    <ImageIcon sx={{ fontSize: 40 }} />
                  </Box>
                `;
              }}
            />
          ) : (
            <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
          )}
        </CardMedia>

        {/* Content */}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography 
              variant="h6" 
              component="h3"
              sx={{ 
                fontSize: '1rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                maxHeight: '2.6em',
                mr: 1
              }}
            >
              {item.title}
            </Typography>
            <StatusBadge statusId={item.statusId} />
          </Box>

          {/* Price */}
          {item.price && (
            <Typography 
              variant="h6" 
              component="p"
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                mb: 1
              }}
            >
              {formatPrice(item.price)}
            </Typography>
          )}

          {/* Posted Date */}
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            Posted {formatDate(item.postedDate)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/**
 * Loading Skeleton for Item Cards
 */
function ItemCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Skeleton variant="text" width="70%" height={24} />
          <Skeleton variant="rounded" width={60} height={20} />
        </Box>
        <Skeleton variant="text" width={80} height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={120} height={20} />
      </CardContent>
    </Card>
  );
}

/**
 * My Listings Component
 * Grid display of user's items with loading and empty states
 */
export function MyListings({ 
  items, 
  loading, 
  onItemClick,
  onAddItem,
  className = '' 
}: MyListingsProps) {
  // Loading state
  if (loading) {
    return (
      <Box className={className}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="text" width={80} height={24} />
        </Stack>
        
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid key={index} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%', lg: '25%' } }}>
              <ItemCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <Box 
        className={className}
        sx={{ 
          textAlign: 'center', 
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box 
          sx={{ 
            width: 64, 
            height: 64, 
            borderRadius: 2,
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}
        >
          <ImageIcon sx={{ fontSize: 32, color: 'grey.400' }} />
        </Box>
        
        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          No items posted yet
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
          You haven't posted any items for sale or exchange. Start sharing your items with the community!
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={onAddItem}
          size="large"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5
          }}
        >
          Post Your First Item
        </Button>
      </Box>
    );
  }

  // Items grid
  return (
    <Box className={className}>
      {/* Header */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
          My Listings
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddItem}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Add Item
          </Button>
        </Box>
      </Stack>

      {/* Items Grid */}
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid key={item.itemId} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%', lg: '25%' } }}>
            <ItemCard
              item={item}
              onClick={onItemClick}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/*
 * Component Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - MyListings: Only displays items grid with states
 *    - ItemCard: Only displays individual item information
 *    - StatusBadge: Only handles status display logic
 *    - No business logic, API calls, or external state
 * 
 * 2. Interface Segregation Principle (ISP):
 *    - Clean props interfaces with only required data
 *    - Optional click handlers for interaction
 *    - No forced dependencies on unused features
 * 
 * 3. Pure Components:
 *    - Predictable output based on props
 *    - No side effects or external dependencies
 *    - Easy to test with different data sets
 * 
 * 4. Responsive Design:
 *    - Grid adapts to different screen sizes
 *    - Proper aspect ratios for thumbnails
 *    - Mobile-friendly touch targets
 * 
 * 5. User Experience:
 *    - Loading skeletons during data fetch
 *    - Empty state with call-to-action
 *    - Image error handling with fallbacks
 *    - Proper formatting for prices and dates
 * 
 * 6. Accessibility:
 *    - Semantic HTML structure
 *    - Proper alt text for images
 *    - Keyboard navigation support
 * 
 * Usage Examples:
 * 
 * // Basic usage
 * <MyListings items={userItems} loading={false} />
 * 
 * // With loading state
 * <MyListings items={[]} loading={true} />
 * 
 * // With click handler
 * <MyListings 
 *   items={userItems} 
 *   loading={false}
 *   onItemClick={(item) => navigate(`/items/${item.itemId}`)}
 * />
 */