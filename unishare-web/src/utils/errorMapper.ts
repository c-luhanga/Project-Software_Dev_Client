/**
 * Error mapping utility following Single Responsibility Principle
 * 
 * Responsibility:
 * - Transform technical/infrastructure errors into user-friendly messages
 * - Provide consistent error messaging across the application
 * - Map HTTP status codes and error types to meaningful descriptions
 * 
 * Does NOT:
 * - Handle UI display logic
 * - Manage error state
 * - Perform logging or analytics
 */

/**
 * Common error types from infrastructure layer
 */
export interface InfrastructureError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * User-friendly error categories
 */
export const ErrorCategory = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown',
} as const;

export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory];

/**
 * Mapped error result
 */
export interface MappedError {
  message: string;
  category: ErrorCategory;
  isRetryable: boolean;
  technicalDetails?: string;
}

/**
 * HTTP status code to error category mapping
 */
const STATUS_CODE_MAPPING: Record<number, ErrorCategory> = {
  400: ErrorCategory.VALIDATION,
  401: ErrorCategory.AUTHENTICATION,
  403: ErrorCategory.AUTHORIZATION,
  404: ErrorCategory.VALIDATION,
  409: ErrorCategory.VALIDATION,
  422: ErrorCategory.VALIDATION,
  429: ErrorCategory.SERVER,
  500: ErrorCategory.SERVER,
  502: ErrorCategory.SERVER,
  503: ErrorCategory.SERVER,
  504: ErrorCategory.SERVER,
};

/**
 * User-friendly messages by error category
 */
const CATEGORY_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Unable to connect to the server. Please check your internet connection and try again.',
  [ErrorCategory.AUTHENTICATION]: 'Your session has expired. Please log in again.',
  [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ErrorCategory.VALIDATION]: 'The information provided is invalid. Please check your input and try again.',
  [ErrorCategory.SERVER]: 'Something went wrong on our end. Please try again in a few moments.',
  [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Specific error message mappings for common scenarios
 */
const SPECIFIC_ERROR_MAPPING: Record<string, string> = {
  // Authentication errors
  'Invalid credentials': 'The email or password you entered is incorrect.',
  'User not found': 'No account found with this email address.',
  'Email already exists': 'An account with this email address already exists.',
  'Password too weak': 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
  'Token expired': 'Your session has expired. Please log in again.',
  'Invalid token': 'Your session is invalid. Please log in again.',
  
  // Network errors
  'Network Error': 'Unable to connect to the server. Please check your internet connection.',
  'Request timeout': 'The request took too long to complete. Please try again.',
  'Connection refused': 'Unable to connect to the server. Please try again later.',
  
  // Validation errors
  'Email format invalid': 'Please enter a valid email address.',
  'Required field missing': 'Please fill in all required fields.',
  'Invalid input format': 'Please check the format of your input.',
  
  // Server errors
  'Internal server error': 'Something went wrong on our end. Please try again later.',
  'Service unavailable': 'The service is temporarily unavailable. Please try again later.',
  'Rate limit exceeded': 'Too many requests. Please wait a moment before trying again.',
};

/**
 * Determine error category based on status code and message
 */
function determineCategory(error: InfrastructureError): ErrorCategory {
  // Check status code mapping first
  if (error.status && STATUS_CODE_MAPPING[error.status]) {
    return STATUS_CODE_MAPPING[error.status];
  }
  
  // Check message patterns for network errors
  if (error.message.toLowerCase().includes('network') || 
      error.message.toLowerCase().includes('connection') ||
      error.code === 'NETWORK_ERROR') {
    return ErrorCategory.NETWORK;
  }
  
  // Check for authentication patterns
  if (error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('authentication') ||
      error.message.toLowerCase().includes('token') ||
      error.message.toLowerCase().includes('session')) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  // Check for validation patterns
  if (error.message.toLowerCase().includes('validation') ||
      error.message.toLowerCase().includes('invalid') ||
      error.message.toLowerCase().includes('required')) {
    return ErrorCategory.VALIDATION;
  }
  
  return ErrorCategory.UNKNOWN;
}

/**
 * Determine if error is retryable based on category and status
 */
function isRetryable(category: ErrorCategory, status?: number): boolean {
  switch (category) {
    case ErrorCategory.NETWORK:
      return true;
    case ErrorCategory.SERVER:
      return status !== 500; // Don't retry internal server errors
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.VALIDATION:
    case ErrorCategory.UNKNOWN:
    default:
      return false;
  }
}

/**
 * Get user-friendly message for error
 */
function getUserFriendlyMessage(error: InfrastructureError, category: ErrorCategory): string {
  // Check for specific error message mappings first
  const specificMessage = SPECIFIC_ERROR_MAPPING[error.message];
  if (specificMessage) {
    return specificMessage;
  }
  
  // Check for partial message matches
  for (const [key, message] of Object.entries(SPECIFIC_ERROR_MAPPING)) {
    if (error.message.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }
  
  // Fall back to category-based message
  return CATEGORY_MESSAGES[category];
}

/**
 * Main error mapping function
 * Transforms infrastructure errors into user-friendly mapped errors
 */
export function mapError(error: unknown): MappedError {
  // Handle null/undefined errors
  if (!error) {
    return {
      message: CATEGORY_MESSAGES[ErrorCategory.UNKNOWN],
      category: ErrorCategory.UNKNOWN,
      isRetryable: false,
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    const category = determineCategory({ message: error });
    return {
      message: getUserFriendlyMessage({ message: error }, category),
      category,
      isRetryable: isRetryable(category),
      technicalDetails: error,
    };
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    const infraError: InfrastructureError = {
      message: error.message,
      // Try to extract status from error if available
      status: (error as any).status || (error as any).response?.status,
      code: (error as any).code,
      details: (error as any).response?.data,
    };
    
    const category = determineCategory(infraError);
    
    return {
      message: getUserFriendlyMessage(infraError, category),
      category,
      isRetryable: isRetryable(category, infraError.status),
      technicalDetails: error.message,
    };
  }
  
  // Handle infrastructure error objects
  if (typeof error === 'object' && error !== null) {
    const infraError = error as InfrastructureError;
    const category = determineCategory(infraError);
    
    return {
      message: getUserFriendlyMessage(infraError, category),
      category,
      isRetryable: isRetryable(category, infraError.status),
      technicalDetails: infraError.message,
    };
  }
  
  // Fallback for unknown error types
  return {
    message: CATEGORY_MESSAGES[ErrorCategory.UNKNOWN],
    category: ErrorCategory.UNKNOWN,
    isRetryable: false,
    technicalDetails: String(error),
  };
}

/**
 * Convenience function for getting just the user message
 */
export function getErrorMessage(error: unknown): string {
  return mapError(error).message;
}

/**
 * Check if an error is retryable
 */
export function isErrorRetryable(error: unknown): boolean {
  return mapError(error).isRetryable;
}

/**
 * Get error category for analytics or conditional handling
 */
export function getErrorCategory(error: unknown): ErrorCategory {
  return mapError(error).category;
}