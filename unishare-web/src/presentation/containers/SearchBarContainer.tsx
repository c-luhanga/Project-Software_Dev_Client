/**
 * Search Bar Container Component
 * 
 * Container component that connects the SearchBar presentation component
 * to search functionality using the original seamless approach from HomePage.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useLocation } from 'react-router-dom';
import type { AppDispatch } from '../../store/store';
import {
  searchItemsThunk,
  selectIsItemsLoading
} from '../../store/itemsSlice';
import { SearchBar } from '../components/shell/SearchBar';

/**
 * SearchBarContainer - Container component for navbar search functionality
 * 
 * Uses the original seamless approach from HomePage:
 * - Immediate local state updates for responsive UI
 * - Direct search execution without debouncing
 * - Simple URL parameter management
 * - No complex re-render prevention logic
 */
export const SearchBarContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Local search state (for immediate UI responsiveness)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('0');
  
  // Redux state selectors
  const isLoading = useSelector(selectIsItemsLoading);
  
  // Constants
  const PAGE_SIZE = 12;
  
  // Check if we're on a page where search should be active
  const isSearchPage = location.pathname === '/' || location.pathname.startsWith('/browse');

  /**
   * Initialize state from URL parameters only once on mount
   */
  useEffect(() => {
    if (!isSearchPage) return;
    
    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId') || '0';
    
    setSearchQuery(q);
    setSelectedCategory(categoryId);
  }, [isSearchPage]); // Only run when page changes, not on every searchParams change

  /**
   * Update URL parameters with debouncing to avoid excessive history entries
   */
  const updateURL = useCallback((query: string, categoryId: string) => {
    const newSearchParams = new URLSearchParams();
    if (query.trim()) newSearchParams.set('q', query.trim());
    if (categoryId && categoryId !== '0') newSearchParams.set('categoryId', categoryId);
    
    // Preserve current page unless query/category changed (which would reset to page 1)
    const currentPage = searchParams.get('page');
    const currentQuery = searchParams.get('q') || '';
    const currentCategoryId = searchParams.get('categoryId') || '0';
    
    // Only preserve page if query and category haven't changed
    if (currentPage && currentPage !== '1' && 
        query.trim() === currentQuery && 
        categoryId === currentCategoryId) {
      newSearchParams.set('page', currentPage);
    }
    
    // Only update URL if it's different to avoid unnecessary navigation
    const newUrl = newSearchParams.toString();
    if (newUrl !== searchParams.toString()) {
      setSearchParams(newSearchParams, { replace: true }); // Use replace to avoid cluttering history
    }
  }, [searchParams, setSearchParams]);

  /**
   * Debounced URL update effect (for shareable URLs without disrupting UX)
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL(searchQuery, selectedCategory);
    }, 1000); // Update URL after 1 second of no changes

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, updateURL]);

  /**
   * Handle search query change - immediate search, delayed URL update
   */
  const handleSearchChange = useCallback((newQuery: string) => {
    // 1. Update local state immediately (no re-render of parent)
    setSearchQuery(newQuery);
    
    // 2. Get current page from URL, reset to page 1 only when query changes
    const currentPage = parseInt(searchParams.get('page') || '1');
    const resetToFirstPage = newQuery !== searchParams.get('q'); // Only reset if query actually changed
    
    // 3. Perform search immediately (responsive results)
    dispatch(searchItemsThunk({
      query: newQuery || undefined,
      categoryId: selectedCategory && selectedCategory !== '0' ? parseInt(selectedCategory) : undefined,
      page: resetToFirstPage ? 1 : currentPage,
      pageSize: PAGE_SIZE
    }));
  }, [dispatch, selectedCategory, searchParams]); // Include searchParams to get current page

  /**
   * Handle category filter change - immediate search and URL update
   */
  const handleCategoryChange = useCallback((newCategory: string) => {
    // 1. Update local state immediately
    setSelectedCategory(newCategory);
    
    // 2. Get current page from URL, reset to page 1 only when category changes
    const currentPage = parseInt(searchParams.get('page') || '1');
    const resetToFirstPage = newCategory !== searchParams.get('categoryId'); // Only reset if category actually changed
    
    // 3. Perform search immediately using current searchQuery
    dispatch(searchItemsThunk({
      query: searchQuery || undefined,
      categoryId: newCategory && newCategory !== '0' ? parseInt(newCategory) : undefined,
      page: resetToFirstPage ? 1 : currentPage,
      pageSize: PAGE_SIZE
    }));
    
    // 4. Update URL immediately for category (less frequent than typing)
    const newSearchParams = new URLSearchParams();
    if (searchQuery.trim()) newSearchParams.set('q', searchQuery.trim());
    if (newCategory && newCategory !== '0') newSearchParams.set('categoryId', newCategory);
    // Preserve page if category didn't actually change
    if (!resetToFirstPage && currentPage > 1) {
      newSearchParams.set('page', currentPage.toString());
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [dispatch, searchQuery, setSearchParams, searchParams]); // Include searchParams to get current page

  // Don't render search bar if not on a search-enabled page
  if (!isSearchPage) {
    return null;
  }

  return (
    <SearchBar
      searchQuery={searchQuery}
      selectedCategory={selectedCategory}
      isLoading={isLoading}
      onSearchChange={handleSearchChange}
      onCategoryChange={handleCategoryChange}
    />
  );
};

/**
 * Default export for easier importing
 */
export default SearchBarContainer;