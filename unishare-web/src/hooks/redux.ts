import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { useState, useCallback } from 'react';

/**
 * Typed hooks for Redux following Single Responsibility Principle
 * Each hook has a single purpose: type-safe state access or dispatch
 */

/**
 * Type-safe useDispatch hook
 * Provides dispatch with proper typing for thunks and actions
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

/**
 * Type-safe useSelector hook
 * Provides selector with proper RootState typing
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Custom hook for common store operations
 * Combines dispatch and selector for convenience while maintaining type safety
 */
export const useStore = () => {
  const dispatch = useAppDispatch();
  const selector = useAppSelector;
  
  return { dispatch, selector } as const;
};

/**
 * Generic hook for async operations with loading states
 * Helps with consistent error handling across components
 */
export function useAsyncOperation<T>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset
  };
}