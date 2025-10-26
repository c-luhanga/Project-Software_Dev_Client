/**
 * Error Display Component following Single Responsibility Principle
 * 
 * Responsibility:
 * - Display error messages in a consistent, user-friendly way
 * - Handle error dismissal and retry actions
 * - Provide appropriate visual feedback based on error type
 * 
 * Does NOT:
 * - Map or transform errors (done by errorMapper)
 * - Manage error state (done by parent components/Redux)
 * - Perform business logic (done by services)
 */

import React from 'react';
import { Alert, AlertTitle, Button, Snackbar, Box } from '@mui/material';
import { Refresh, Close } from '@mui/icons-material';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

/**
 * Error display props interface
 */
export interface ErrorDisplayProps {
  /**
   * Error message to display
   */
  error: string | null;
  
  /**
   * Whether to show the error (for controlled visibility)
   */
  open?: boolean;
  
  /**
   * Display variant
   */
  variant?: 'inline' | 'snackbar';
  
  /**
   * Callback when user dismisses the error
   */
  onClose?: () => void;
  
  /**
   * Callback when user clicks retry
   */
  onRetry?: () => void;
  
  /**
   * Custom retry label (overrides default)
   */
  retryLabel?: string;
  
  /**
   * Whether to show close button
   */
  showClose?: boolean;
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Data test id for testing
   */
  'data-testid'?: string;
}

/**
 * Inline error display component
 */
const InlineErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClose,
  onRetry,
  retryLabel,
  showClose = true,
  className,
  'data-testid': testId,
}) => {
  const { getErrorConfig, canRetry, getRetryMessage } = useErrorHandler();
  
  if (!error) return null;
  
  const config = getErrorConfig(error);
  if (!config) return null;
  
  const showRetryButton = config.showRetry && onRetry && canRetry(error);
  const retryMessage = getRetryMessage(error);
  
  return (
    <Alert
      severity={config.severity}
      className={className}
      data-testid={testId}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {showRetryButton && (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<Refresh />}
              data-testid={`${testId}-retry`}
            >
              {retryLabel || config.retryLabel || 'Retry'}
            </Button>
          )}
          {showClose && onClose && (
            <Button
              color="inherit"
              size="small"
              onClick={onClose}
              data-testid={`${testId}-close`}
            >
              <Close />
            </Button>
          )}
        </Box>
      }
    >
      <AlertTitle>Error</AlertTitle>
      {error}
      {retryMessage && (
        <Box component="div" sx={{ mt: 1, fontSize: '0.875rem', opacity: 0.8 }}>
          {retryMessage}
        </Box>
      )}
    </Alert>
  );
};

/**
 * Snackbar error display component
 */
const SnackbarErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  open = true,
  onClose,
  onRetry,
  retryLabel,
  'data-testid': testId,
}) => {
  const { getErrorConfig, canRetry } = useErrorHandler();
  
  if (!error) return null;
  
  const config = getErrorConfig(error);
  if (!config) return null;
  
  const showRetryButton = config.showRetry && onRetry && canRetry(error);
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={config.autoHide ? config.autoHideDuration : null}
      onClose={onClose}
      data-testid={testId}
    >
      <Alert
        severity={config.severity}
        onClose={onClose}
        action={
          showRetryButton ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<Refresh />}
              data-testid={`${testId}-retry`}
            >
              {retryLabel || config.retryLabel || 'Retry'}
            </Button>
          ) : undefined
        }
      >
        {error}
      </Alert>
    </Snackbar>
  );
};

/**
 * Main ErrorDisplay component
 * Renders either inline or snackbar error based on variant prop
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  variant = 'inline',
  ...props
}) => {
  if (variant === 'snackbar') {
    return <SnackbarErrorDisplay {...props} />;
  }
  
  return <InlineErrorDisplay {...props} />;
};

/**
 * Convenience component for auth errors
 */
export const AuthErrorDisplay: React.FC<Omit<ErrorDisplayProps, 'variant'>> = (props) => {
  return <ErrorDisplay variant="inline" {...props} />;
};

/**
 * Convenience component for form validation errors
 */
export const ValidationErrorDisplay: React.FC<Omit<ErrorDisplayProps, 'variant'>> = (props) => {
  return <ErrorDisplay variant="inline" {...props} />;
};

/**
 * Convenience component for global app errors (snackbar)
 */
export const GlobalErrorDisplay: React.FC<Omit<ErrorDisplayProps, 'variant'>> = (props) => {
  return <ErrorDisplay variant="snackbar" {...props} />;
};

export default ErrorDisplay;