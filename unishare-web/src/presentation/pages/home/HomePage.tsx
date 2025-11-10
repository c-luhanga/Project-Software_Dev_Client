import React, { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Pagination,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon
} from '@mui/icons-material';
import type { AppDispatch } from '../../../store/store';
import {
  searchItemsThunk,
  clearError,
  selectItemsList,
  selectItemsListData,
  selectItemsListMetadata,
  selectIsItemsLoading,
  selectItemsError
} from '../../../store/itemsSlice';
import type { ItemSummary } from '../../../domain/items/contracts';
import { ItemImage } from '../../components/common/ItemImage';
import { getStatusLabel, getStatusColor } from '../../../utils/itemStatus';

/**
 * Home Page / Browse Items Container Component
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for item browsing and search functionality
 * - Coordinates search, filtering, and pagination
 * - Manages URL query parameters for shareable state
 * 
 * Container Pattern:
 * - Manages all side effects and state operations
 * - Handles URL synchronization with component state
 * - Orchestrates search workflow via Redux thunks
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Redux state selectors
  const itemsList = useSelector(selectItemsList);
  const itemsData = useSelector(selectItemsListData);
  const metadata = useSelector(selectItemsListMetadata);
  const isLoading = useSelector(selectIsItemsLoading);
  const error = useSelector(selectItemsError);
  
  // Constants
  const PAGE_SIZE = 12;

  /**
   * Perform search with URL parameters
   */
  const performSearch = useCallback(() => {
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    
    // Dispatch search thunk
    dispatch(searchItemsThunk({
      query: query || undefined,
      categoryId: categoryId && categoryId !== '0' ? parseInt(categoryId) : undefined,
      page,
      pageSize: PAGE_SIZE
    }));
  }, [searchParams, dispatch]);

  /**
   * Load initial data on component mount and when search params change
   */
  useEffect(() => {
    dispatch(clearError());
    performSearch();
  }, [dispatch, performSearch]);

  /**
   * Handle page change
   */
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  /**
   * Handle item click - navigate to detail page
   */
  const handleItemClick = (item: ItemSummary) => {
    navigate(`/items/${item.itemId}`);
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
   * Get status chip for item using proper status utilities
   */
  const getStatusChip = (item: ItemSummary) => {
    const label = getStatusLabel(item.statusId);
    const color = getStatusColor(item.statusId);
    
    return <Chip label={label} color={color} size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Browse Items
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find great deals from fellow students
        </Typography>
      </Box>

      {/* Loading State */}
      {isLoading && itemsData.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load items: {error}
        </Alert>
      )}

      {/* Results Summary */}
      {itemsList && !isLoading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {metadata.totalCount > 0
              ? `Showing ${itemsData.length} of ${metadata.totalCount} items`
              : 'No items found matching your criteria'
            }
          </Typography>
        </Box>
      )}

      {/* Items Grid */}
      {itemsData.length > 0 && (
        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3,
              mb: 4
            }}
          >
            {itemsData.map((item, index) => (
              <Card
                key={`item-${item.itemId}-${index}`}
                sx={{
                  height: 360, // Fixed height for all cards
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardActionArea
                  onClick={() => handleItemClick(item)}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    justifyContent: 'flex-start'
                  }}
                >
                  <ItemImage
                    src={item.thumbnailUrl}
                    alt={item.title}
                    height={200} // Fixed image height
                    sx={{ 
                      objectFit: 'cover',
                      flexShrink: 0 // Prevent image from shrinking
                    }}
                  />
                  
                  <CardContent 
                    sx={{ 
                      flexGrow: 1, 
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: 160, // Fixed content height (360 - 200 = 160)
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          sx={{ 
                            flexGrow: 1, 
                            mr: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2, // Limit to 2 lines
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.2,
                            maxHeight: '2.4em' // 2 lines * 1.2 line height
                          }}
                        >
                          {item.title}
                        </Typography>
                        {getStatusChip(item)}
                      </Box>
                      
                      <Typography 
                        variant="h5" 
                        color="primary" 
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formatPrice(item.price)}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        mt: 'auto', // Push to bottom
                        flexShrink: 0
                      }}
                    >
                      Posted {new Date(item.postedDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          {metadata.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={metadata.totalPages}
                page={parseInt(searchParams.get('page') || '1')}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      )}

      {/* Empty State */}
      {itemsData.length === 0 && !isLoading && !error && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'action.hover',
            borderRadius: 2
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No items found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(searchParams.get('q') || searchParams.get('categoryId'))
              ? 'Try adjusting your search criteria or browse all items'
              : 'Be the first to list an item for sale!'
            }
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;