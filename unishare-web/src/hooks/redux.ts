import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';

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