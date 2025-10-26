/**
 * Error handling hook following Single Responsibility Principle
 * 
 * Responsibility:
 * - Provide UI components with error display utilities
 * - Handle error retry logic
 * - Manage error dismissal
 * 
 * Does NOT:
 * - Map or transform errors (done by errorMapper)
 * - Store error state (done by Redux)
 * - Handle network calls (done by services)
 */

import { useCallback } from 'react';
import { mapError, ErrorCategory, type MappedError } from '../utils/errorMapper';
import { useAppDispatch } from '../store';
import { clearError } from '../store/authSlice';

/**
 * Error display configuration
 */
export interface ErrorDisplayConfig {
  severity: 'error' | 'warning' | 'info';
  autoHide?: boolean;
  autoHideDuration?: number;
  showRetry?: boolean;
  retryLabel?: string;
}

/**
 * Hook return type
 */
export interface UseErrorHandlerReturn {
  /**
   * Get display configuration for an error
   */
  getErrorConfig: (error: string | null) => ErrorDisplayConfig | null;
  
  /**
   * Get mapped error details
   */
  getErrorDetails: (error: unknown) => MappedError;
  
  /**
   * Clear auth error from store
   */
  clearAuthError: () => void;
  
  /**
   * Check if error suggests network connectivity issues
   */
  isNetworkError: (error: string | null) => boolean;
  
  /**
   * Check if error is retryable
   */
  canRetry: (error: string | null) => boolean;
  
  /**
   * Get retry message for user
   */
  getRetryMessage: (error: string | null) => string | null;
}

/**
 * Error severity mapping based on category
 */
const CATEGORY_SEVERITY_MAP: Record<ErrorCategory, 'error' | 'warning' | 'info'> = {
  [ErrorCategory.NETWORK]: 'warning',
  [ErrorCategory.AUTHENTICATION]: 'error',
  [ErrorCategory.AUTHORIZATION]: 'error',
  [ErrorCategory.VALIDATION]: 'error',
  [ErrorCategory.SERVER]: 'warning',
  [ErrorCategory.UNKNOWN]: 'error',
};

/**
 * Retry messages for different error categories
 */
const RETRY_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Check your connection and try again',
  [ErrorCategory.SERVER]: 'Please try again in a few moments',
  [ErrorCategory.AUTHENTICATION]: 'Please log in again',
  [ErrorCategory.AUTHORIZATION]: 'Contact support if this issue persists',
  [ErrorCategory.VALIDATION]: 'Please correct the issues and try again',
  [ErrorCategory.UNKNOWN]: 'Please try again',
};

/**
 * Custom hook for error handling in UI components
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const dispatch = useAppDispatch();

  /**
   * Get display configuration for an error message
   */
  const getErrorConfig = useCallback((error: string | null): ErrorDisplayConfig | null => {
    if (!error) return null;

    const mappedError = mapError(error);
    const severity = CATEGORY_SEVERITY_MAP[mappedError.category];

    return {
      severity,
      autoHide: mappedError.category === ErrorCategory.SERVER && mappedError.isRetryable,
      autoHideDuration: 6000, // 6 seconds for auto-hide
      showRetry: mappedError.isRetryable,
      retryLabel: mappedError.isRetryable ? 'Try Again' : undefined,
    };
  }, []);

  /**
   * Get detailed error information
   */
  const getErrorDetails = useCallback((error: unknown): MappedError => {
    return mapError(error);
  }, []);

  /**
   * Clear auth error from Redux store
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Check if error indicates network connectivity issues
   */
  const isNetworkError = useCallback((error: string | null): boolean => {
    if (!error) return false;
    const mappedError = mapError(error);
    return mappedError.category === ErrorCategory.NETWORK;
  }, []);

  /**
   * Check if error is retryable
   */
  const canRetry = useCallback((error: string | null): boolean => {
    if (!error) return false;
    const mappedError = mapError(error);
    return mappedError.isRetryable;
  }, []);

  /**
   * Get appropriate retry message
   */
  const getRetryMessage = useCallback((error: string | null): string | null => {
    if (!error) return null;
    const mappedError = mapError(error);
    
    if (!mappedError.isRetryable) return null;
    
    return RETRY_MESSAGES[mappedError.category];
  }, []);

  return {
    getErrorConfig,
    getErrorDetails,
    clearAuthError,
    isNetworkError,
    canRetry,
    getRetryMessage,
  };
}

/**
 * Convenience hooks for specific error scenarios
 */

/**
 * Hook specifically for auth errors
 */
export function useAuthErrorHandler() {
  const errorHandler = useErrorHandler();
  
  return {
    ...errorHandler,
    // Auth-specific helpers can be added here
    isAuthenticationError: (error: string | null): boolean => {
      if (!error) return false;
      const mappedError = mapError(error);
      return mappedError.category === ErrorCategory.AUTHENTICATION;
    },
    
    isAuthorizationError: (error: string | null): boolean => {
      if (!error) return false;
      const mappedError = mapError(error);
      return mappedError.category === ErrorCategory.AUTHORIZATION;
    },
  };
}

/**
 * Hook for validation errors
 */
export function useValidationErrorHandler() {
  const errorHandler = useErrorHandler();
  
  return {
    ...errorHandler,
    isValidationError: (error: string | null): boolean => {
      if (!error) return false;
      const mappedError = mapError(error);
      return mappedError.category === ErrorCategory.VALIDATION;
    },
    
    getFieldErrors: (error: string | null): string[] => {
      if (!error) return [];
      
      // Simple implementation - can be enhanced for structured validation errors
      const mappedError = mapError(error);
      if (mappedError.category === ErrorCategory.VALIDATION) {
        return [mappedError.message];
      }
      
      return [];
    },
  };
}