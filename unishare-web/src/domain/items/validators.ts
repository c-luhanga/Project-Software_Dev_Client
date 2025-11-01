/**
 * Items Domain Validation
 * 
 * Pure domain validation following SOLID principles:
 * - Single Responsibility Principle (SRP): Each validator has one clear purpose
 * - Open/Closed Principle (OCP): Easy to extend without modifying existing validators
 * - Framework independence: No UI, HTTP, React, or external library dependencies
 * 
 * Domain-Focused Validation:
 * - Business rule enforcement
 * - Pure TypeScript validation without external dependencies
 * - Consistent error format across domain
 * - Reusable across different layers
 */

import type { CreateItemCommand, AddItemImagesCommand } from './contracts';

/**
 * Validation result interface
 * Consistent result format for all domain validators
 */
export interface ValidationResult<T> {
  /** Whether validation succeeded */
  success: boolean;
  /** Parsed and validated data (only present if success is true) */
  data?: T;
  /** Validation errors by field (only present if success is false) */
  errors?: Record<string, string>;
  /** Global error message (only present if success is false) */
  message?: string;
}

/**
 * Validation helper functions
 */
const ValidationHelpers = {
  /**
   * Check if value is a string
   */
  isString(value: unknown): value is string {
    return typeof value === 'string';
  },

  /**
   * Check if value is a number
   */
  isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  },

  /**
   * Check if value is a positive integer
   */
  isPositiveInteger(value: unknown): value is number {
    return this.isNumber(value) && Number.isInteger(value) && value > 0;
  },

  /**
   * Check if value is a non-negative integer (includes 0)
   */
  isNonNegativeInteger(value: unknown): value is number {
    return this.isNumber(value) && Number.isInteger(value) && value >= 0;
  },

  /**
   * Check if string is a valid URL
   */
  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  },

  /**
   * Trim string and check if it's not empty
   */
  isNonEmptyString(value: unknown): value is string {
    return this.isString(value) && value.trim().length > 0;
  },

  /**
   * Check if array has unique values
   */
  hasUniqueValues<T>(array: T[]): boolean {
    return new Set(array).size === array.length;
  }
};

/**
 * Validate CreateItemCommand (SRP)
 * 
 * Single responsibility: Validate item creation data according to business rules
 * 
 * Business Rules:
 * - title: 3-255 characters, required
 * - description: 10-4000 characters, required
 * - categoryId: optional positive integer
 * - price: optional, must be >= 0 (in cents)
 * - conditionId: required, must be in range [1..4]
 * 
 * @param input Raw input data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateCreateItem(input: unknown): ValidationResult<CreateItemCommand> {
  const errors: Record<string, string> = {};

  // Type guard for object
  if (!input || typeof input !== 'object') {
    return {
      success: false,
      message: 'Input must be an object'
    };
  }

  const data = input as Record<string, unknown>;

  // Validate title
  if (!ValidationHelpers.isNonEmptyString(data.title)) {
    errors.title = 'Title is required and must be a non-empty string';
  } else {
    const title = data.title.trim();
    if (title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    } else if (title.length > 255) {
      errors.title = 'Title must not exceed 255 characters';
    }
  }

  // Validate description
  if (!ValidationHelpers.isNonEmptyString(data.description)) {
    errors.description = 'Description is required and must be a non-empty string';
  } else {
    const description = data.description.trim();
    if (description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    } else if (description.length > 4000) {
      errors.description = 'Description must not exceed 4000 characters';
    }
  }

  // Validate categoryId (optional)
  if (data.categoryId !== undefined) {
    if (!ValidationHelpers.isPositiveInteger(data.categoryId)) {
      errors.categoryId = 'Category ID must be a positive integer';
    }
  }

  // Validate price (optional)
  if (data.price !== undefined) {
    if (!ValidationHelpers.isNonNegativeInteger(data.price)) {
      errors.price = 'Price must be zero or a positive integer (in cents)';
    }
  }

  // Validate conditionId (required)
  if (!ValidationHelpers.isPositiveInteger(data.conditionId)) {
    errors.conditionId = 'Condition ID is required and must be a positive integer';
  } else if (data.conditionId < 1 || data.conditionId > 4) {
    errors.conditionId = 'Condition ID must be between 1 and 4';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: 'Item validation failed'
    };
  }

  // Build validated command
  const command: CreateItemCommand = {
    title: (data.title as string).trim(),
    description: (data.description as string).trim(),
    conditionId: data.conditionId as number,
    ...(data.categoryId !== undefined && { categoryId: data.categoryId as number }),
    ...(data.price !== undefined && { price: data.price as number })
  };

  return {
    success: true,
    data: command
  };
}

/**
 * Validate AddItemImagesCommand (SRP)
 * 
 * Single responsibility: Validate image addition data according to business rules
 * 
 * Business Rules:
 * - itemId: required positive integer
 * - imageUrls: 1-4 absolute URLs, all must be valid HTTP/HTTPS URLs
 * 
 * @param input Raw input data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateAddImages(input: unknown): ValidationResult<AddItemImagesCommand> {
  const errors: Record<string, string> = {};

  // Type guard for object
  if (!input || typeof input !== 'object') {
    return {
      success: false,
      message: 'Input must be an object'
    };
  }

  const data = input as Record<string, unknown>;

  // Validate itemId
  if (!ValidationHelpers.isPositiveInteger(data.itemId)) {
    errors.itemId = 'Item ID is required and must be a positive integer';
  }

  // Validate imageUrls
  if (!Array.isArray(data.imageUrls)) {
    errors.imageUrls = 'Image URLs must be an array';
  } else {
    const imageUrls = data.imageUrls;

    // Check array length
    if (imageUrls.length < 1) {
      errors.imageUrls = 'At least one image URL is required';
    } else if (imageUrls.length > 4) {
      errors.imageUrls = 'Maximum 4 image URLs allowed';
    } else {
      // Validate each URL
      const invalidUrls: string[] = [];
      const validUrls: string[] = [];

      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        
        if (!ValidationHelpers.isString(url)) {
          invalidUrls.push(`URL at index ${i} must be a string`);
        } else if (!ValidationHelpers.isValidUrl(url)) {
          invalidUrls.push(`URL at index ${i} must be a valid absolute HTTP or HTTPS URL`);
        } else {
          validUrls.push(url);
        }
      }

      if (invalidUrls.length > 0) {
        errors.imageUrls = invalidUrls.join(', ');
      } else if (!ValidationHelpers.hasUniqueValues(validUrls)) {
        errors.imageUrls = 'Image URLs must be unique';
      }
    }
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: 'Image validation failed'
    };
  }

  // Build validated command
  const command: AddItemImagesCommand = {
    itemId: data.itemId as number,
    imageUrls: data.imageUrls as string[]
  };

  return {
    success: true,
    data: command
  };
}

/**
 * Helper function to validate item ID (reusable validation)
 * 
 * @param itemId Item ID to validate
 * @returns Validation result for item ID
 */
export function validateItemId(itemId: unknown): ValidationResult<number> {
  if (!ValidationHelpers.isPositiveInteger(itemId)) {
    return {
      success: false,
      errors: { itemId: 'Item ID must be a positive integer' },
      message: 'Item ID validation failed'
    };
  }

  return {
    success: true,
    data: itemId
  };
}

/**
 * Helper function to validate search parameters
 * 
 * @param params Search parameters to validate
 * @returns Validation result for search parameters
 */
export function validateSearchParams(params: {
  query?: unknown;
  categoryId?: unknown;
  page?: unknown;
  pageSize?: unknown;
}): ValidationResult<{
  query?: string;
  categoryId?: number;
  page: number;
  pageSize: number;
}> {
  const errors: Record<string, string> = {};
  
  // Default values
  let page = 1;
  let pageSize = 20;

  // Validate query (optional)
  let query: string | undefined;
  if (params.query !== undefined) {
    if (!ValidationHelpers.isString(params.query)) {
      errors.query = 'Query must be a string';
    } else {
      const trimmedQuery = params.query.trim();
      if (trimmedQuery.length === 0) {
        errors.query = 'Query cannot be empty';
      } else if (trimmedQuery.length > 500) {
        errors.query = 'Query must not exceed 500 characters';
      } else {
        query = trimmedQuery;
      }
    }
  }

  // Validate categoryId (optional)
  let categoryId: number | undefined;
  if (params.categoryId !== undefined) {
    if (!ValidationHelpers.isPositiveInteger(params.categoryId)) {
      errors.categoryId = 'Category ID must be a positive integer';
    } else {
      categoryId = params.categoryId;
    }
  }

  // Validate page
  if (params.page !== undefined) {
    if (!ValidationHelpers.isPositiveInteger(params.page)) {
      errors.page = 'Page must be a positive integer';
    } else {
      page = params.page;
    }
  }

  // Validate pageSize
  if (params.pageSize !== undefined) {
    if (!ValidationHelpers.isPositiveInteger(params.pageSize)) {
      errors.pageSize = 'Page size must be a positive integer';
    } else if (params.pageSize > 100) {
      errors.pageSize = 'Page size must not exceed 100';
    } else {
      pageSize = params.pageSize;
    }
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: 'Search parameters validation failed'
    };
  }

  return {
    success: true,
    data: {
      query,
      categoryId,
      page,
      pageSize
    }
  };
}

/**
 * Validation error creation helper
 * Creates consistent error format for business rule violations
 */
export function createValidationError(
  field: string,
  message: string
): ValidationResult<never> {
  return {
    success: false,
    errors: { [field]: message },
    message: `Validation failed for ${field}`
  };
}

/**
 * Business rule validation helpers
 * Additional validation beyond basic type checking
 */
export const BusinessRules = {
  /**
   * Check if price is reasonable for the platform
   */
  isReasonablePrice(price: number): boolean {
    // Business rule: price should be between $0.01 and $100,000
    return price >= 1 && price <= 10000000; // in cents
  },

  /**
   * Check if title contains prohibited words
   */
  hasProhibitedContent(text: string): boolean {
    const prohibitedWords = ['scam', 'fake', 'stolen', 'illegal'];
    const lowerText = text.toLowerCase();
    return prohibitedWords.some(word => lowerText.includes(word));
  },

  /**
   * Check if description has minimum meaningful content
   */
  hasMinimumMeaningfulContent(description: string): boolean {
    // Remove common filler words and check remaining content
    const meaningfulWords = description
      .toLowerCase()
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'but', 'words', 'use', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other'].includes(word)
      );
    
    return meaningfulWords.length >= 3;
  }
};

/**
 * Enhanced validation with business rules
 * Combines basic validation with business rule checks
 */
export function validateCreateItemWithBusinessRules(
  input: unknown
): ValidationResult<CreateItemCommand> {
  // First, run basic validation
  const basicResult = validateCreateItem(input);
  
  if (!basicResult.success) {
    return basicResult;
  }

  const data = basicResult.data!;
  const errors: Record<string, string> = {};

  // Apply business rules
  if (BusinessRules.hasProhibitedContent(data.title)) {
    errors.title = 'Title contains prohibited content';
  }

  if (BusinessRules.hasProhibitedContent(data.description)) {
    errors.description = 'Description contains prohibited content';
  }

  if (!BusinessRules.hasMinimumMeaningfulContent(data.description)) {
    errors.description = 'Description must contain meaningful content beyond common words';
  }

  if (data.price && !BusinessRules.isReasonablePrice(data.price)) {
    errors.price = 'Price must be between $0.01 and $100,000';
  }

  // Return errors if any business rules failed
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: 'Business rule validation failed'
    };
  }

  return basicResult;
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - validateCreateItem: Only validates item creation commands
 * - validateAddImages: Only validates image addition commands
 * - validateItemId: Only validates item ID format
 * - validateSearchParams: Only validates search parameters
 * - Each function has single, focused responsibility
 * 
 * Open/Closed Principle (OCP):
 * - Easy to add new validators without modifying existing ones
 * - Business rules can be extended without changing core validation
 * - ValidationHelpers can be composed and reused
 * - New validation functions follow same pattern
 * 
 * Dependency Inversion Principle (DIP):
 * - Validators depend on ValidationResult interface abstraction
 * - No dependencies on external validation libraries
 * - No dependencies on UI frameworks or HTTP libraries
 * 
 * Benefits:
 * - Pure Domain Logic: No external dependencies beyond TypeScript
 * - Type-Safe: Full TypeScript support with native type checking
 * - Consistent: Uniform error format across all validators
 * - Extensible: Easy to add new validation rules and business logic
 * - Testable: Pure functions that are easy to unit test
 * - Reusable: Can be used across different layers and contexts
 * - Lightweight: No external library dependencies
 * 
 * Error Handling:
 * - Consistent ValidationResult interface
 * - Field-specific error messages
 * - Business rule validation beyond basic type checking
 * - Graceful handling of unexpected input types
 * 
 * Usage Examples:
 * 
 * // Basic validation
 * const result = validateCreateItem(userInput);
 * if (result.success) {
 *   await itemService.create(result.data);
 * } else {
 *   displayErrors(result.errors);
 * }
 * 
 * // Enhanced validation with business rules
 * const enhancedResult = validateCreateItemWithBusinessRules(userInput);
 * if (enhancedResult.success) {
 *   await itemService.create(enhancedResult.data);
 * }
 * 
 * // Image validation
 * const imageResult = validateAddImages({
 *   itemId: 123,
 *   imageUrls: ["https://example.com/image1.jpg"]
 * });
 * 
 * // Search parameter validation
 * const searchResult = validateSearchParams({
 *   query: "laptop",
 *   categoryId: 1,
 *   page: 1,
 *   pageSize: 20
 * });
 */