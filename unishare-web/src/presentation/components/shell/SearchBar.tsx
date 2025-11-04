/**
 * Search Bar Component for Navbar
 * 
 * Presentational component that handles search and category filtering
 * for the main navigation bar. Designed to be persistent and sticky.
 */

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

/**
 * Search bar component props
 */
export interface SearchBarProps {
  /** Current search query value */
  readonly searchQuery: string;
  
  /** Current selected category ID */
  readonly selectedCategory: string;
  
  /** Whether the search is currently loading */
  readonly isLoading?: boolean;
  
  /** Callback when search query changes */
  readonly onSearchChange: (query: string) => void;
  
  /** Callback when category selection changes */
  readonly onCategoryChange: (categoryId: string) => void;
}

/**
 * Available categories for filtering
 */
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
 * Styled components for consistent appearance
 */
const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexGrow: 1,
  maxWidth: 600,
  margin: theme.spacing(0, 2),
  [theme.breakpoints.down('md')]: {
    maxWidth: 400,
    gap: theme.spacing(0.5)
  },
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(0, 1)
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  flexGrow: 1,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.spacing(1),
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.7)'
    },
    '& input': {
      color: 'white',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.7)',
        opacity: 1
      }
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      color: 'rgba(255, 255, 255, 0.7)'
    }
  }
}));

const CategorySelect = styled(FormControl)(({ theme }) => ({
  minWidth: 140,
  [theme.breakpoints.down('md')]: {
    minWidth: 120
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 100
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: 'rgba(255, 255, 255, 0.9)'
    }
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.spacing(1),
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.7)'
    },
    '& .MuiSelect-icon': {
      color: 'rgba(255, 255, 255, 0.7)'
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      color: 'rgba(255, 255, 255, 0.7)'
    }
  }
}));

/**
 * SearchBar - Navbar search and category filter component
 * 
 * Features:
 * - Real-time search input with debouncing support
 * - Category dropdown filter
 * - Responsive design that adapts to different screen sizes
 * - Consistent styling with navbar theme
 * - Accessibility support with proper labels
 * 
 * @param props Component props
 * @returns Rendered search bar component
 */
const SearchBarComponent: React.FC<SearchBarProps> = ({
  searchQuery,
  selectedCategory,
  isLoading = false,
  onSearchChange,
  onCategoryChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  /**
   * Handle search input change
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  /**
   * Handle category selection change
   */
  const handleCategoryChange = (event: any) => {
    onCategoryChange(event.target.value as string);
  };

  return (
    <SearchContainer>
      {/* Search Input */}
      <SearchField
        placeholder={isMobile ? "Search..." : "Search items..."}
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={isLoading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        aria-label="Search for items"
      />

      {/* Category Filter - Hidden on mobile to save space */}
      {!isMobile && (
        <CategorySelect size="small">
          <InputLabel 
            id="category-select-label"
            sx={{ fontSize: isTablet ? '0.875rem' : '1rem' }}
          >
            Category
          </InputLabel>
          <Select
            labelId="category-select-label"
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Category"
            disabled={isLoading}
            startAdornment={
              <InputAdornment position="start">
                <CategoryIcon />
              </InputAdornment>
            }
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    fontSize: isTablet ? '0.875rem' : '1rem'
                  }
                }
              }
            }}
          >
            {CATEGORIES.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {isTablet && category.label.length > 12 
                  ? `${category.label.substring(0, 10)}...` 
                  : category.label
                }
              </MenuItem>
            ))}
          </Select>
        </CategorySelect>
      )}
    </SearchContainer>
  );
};

/**
 * Memoized SearchBar component to prevent unnecessary re-renders
 */
export const SearchBar = React.memo(SearchBarComponent);

/**
 * Display name for debugging
 */
SearchBar.displayName = 'SearchBar';

/**
 * Default export for easier importing
 */
export default SearchBar;