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
    
    // 2. Perform search immediately (responsive results)
    dispatch(searchItemsThunk({
      query: newQuery || undefined,
      categoryId: selectedCategory && selectedCategory !== '0' ? parseInt(selectedCategory) : undefined,
      page: 1,
      pageSize: PAGE_SIZE
    }));
  }, [dispatch]); // Only depend on dispatch, use current values from closure

  /**
   * Handle category filter change - immediate search and URL update
   */
  const handleCategoryChange = useCallback((newCategory: string) => {
    // 1. Update local state immediately
    setSelectedCategory(newCategory);
    
    // 2. Perform search immediately using current searchQuery
    dispatch(searchItemsThunk({
      query: searchQuery || undefined,
      categoryId: newCategory && newCategory !== '0' ? parseInt(newCategory) : undefined,
      page: 1,
      pageSize: PAGE_SIZE
    }));
    
    // 3. Update URL immediately for category (less frequent than typing)
    const newSearchParams = new URLSearchParams();
    if (searchQuery.trim()) newSearchParams.set('q', searchQuery.trim());
    if (newCategory && newCategory !== '0') newSearchParams.set('categoryId', newCategory);
    setSearchParams(newSearchParams, { replace: true });
  }, [dispatch, searchQuery, setSearchParams]); // Keep minimal dependencies

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