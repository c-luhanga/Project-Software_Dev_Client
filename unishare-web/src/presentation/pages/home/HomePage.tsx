import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Category as CategoryIcon
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
  
  // Local search state (for controlled inputs)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('0');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Constants
  const PAGE_SIZE = 12;
  const CATEGORIES = [
    { id: '0', label: 'All Categories' },
    { id: '1', label: 'Electronics' },
    { id: '2', label: 'Books' },
    { id: '3', label: 'Clothing' },
    { id: '4', label: 'Furniture' },
    { id: '5', label: 'Sports & Recreation' },
    { id: '6', label: 'Other' }
  ];

  /**
   * Initialize state from URL parameters
   */
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId') || '0';
    const page = parseInt(searchParams.get('page') || '1');
    
    setSearchQuery(q);
    setSelectedCategory(categoryId);
    setCurrentPage(page);
  }, [searchParams]);

  /**
   * Perform search with current parameters
   */
  const performSearch = useCallback((
    query: string = searchQuery,
    categoryId: string = selectedCategory,
    page: number = currentPage
  ) => {
    // Update URL query parameters
    const newSearchParams = new URLSearchParams();
    if (query) newSearchParams.set('q', query);
    if (categoryId && categoryId !== '0') newSearchParams.set('categoryId', categoryId);
    if (page > 1) newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);

    // Dispatch search thunk
    dispatch(searchItemsThunk({
      query: query || undefined,
      categoryId: categoryId && categoryId !== '0' ? parseInt(categoryId) : undefined,
      page,
      pageSize: PAGE_SIZE
    }));
  }, [searchQuery, selectedCategory, currentPage, dispatch, setSearchParams]);

  /**
   * Load initial data on component mount
   */
  useEffect(() => {
    dispatch(clearError());
    performSearch();
  }, [dispatch]); // Only run on mount

  /**
   * Handle search query change
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setSearchQuery(newQuery);
    setCurrentPage(1); // Reset to first page
    performSearch(newQuery, selectedCategory, 1);
  };

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (event: any) => {
    const newCategory = event.target.value as string;
    setSelectedCategory(newCategory);
    setCurrentPage(1); // Reset to first page
    performSearch(searchQuery, newCategory, 1);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    performSearch(searchQuery, selectedCategory, page);
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
   * Get status chip for item
   */
  const getStatusChip = (item: ItemSummary) => {
    // Assuming statusId 2 means sold
    if (item.statusId === 2) {
      return <Chip label="Sold" color="error" size="small" />;
    }
    return <Chip label="Available" color="success" size="small" />;
  };

  /**
   * Get item image or placeholder
   */
  const getItemImage = (_item: ItemSummary) => {
    // ItemSummary doesn't have images, use placeholder
    return '/placeholder-image.jpg';
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

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          {/* Search Input */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for items..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { md: 400 } }}
          />

          {/* Category Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Category"
              startAdornment={
                <InputAdornment position="start">
                  <CategoryIcon />
                </InputAdornment>
              }
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
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
                  height: '100%',
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
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={getItemImage(item)}
                    alt={item.title}
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
                    
                    <Typography variant="caption" color="text.secondary">
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
                page={currentPage}
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
            {searchQuery || (selectedCategory && selectedCategory !== '0')
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