/**
 * Messaging Domain Validators
 * 
 * Pure domain validation following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles messaging command validation
 * - Open/Closed Principle (OCP): Extensible validation rules without modifying existing code
 * - Dependency Inversion Principle (DIP): No UI framework dependencies
 * 
 * Framework Independence:
 * - No external dependencies (Zod, React, Redux, etc.)
 * - Pure TypeScript validation logic with typed error handling
 * - Can be used by any presentation or infrastructure layer
 */

import type { StartConversationCommand, SendMessageCommand } from './contracts';

/**
 * Validation error structure for consistent error handling
 * Provides structured validation feedback without UI concerns
 */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

/**
 * Validation result type for type-safe error handling
 * Either successful parsing or structured error information
 */
export type ValidationResult<T> = {
  readonly success: true;
  readonly data: T;
} | {
  readonly success: false;
  readonly errors: ValidationError[];
};

/**
 * Pure TypeScript validation for StartConversationCommand
 * 
 * Rules:
 * - otherUserId: Required positive integer
 * - itemId: Optional positive integer
 * 
 * @param input Unknown input to validate
 * @returns ValidationResult with parsed data or errors
 */
function validateStartConversationInput(input: unknown): ValidationResult<StartConversationCommand> {
  const errors: ValidationError[] = [];
  
  // Type guard: ensure input is an object
  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: [{
        field: 'root',
        message: 'Input must be an object'
      }]
    };
  }
  
  const obj = input as Record<string, unknown>;
  
  // Validate otherUserId
  if (!('otherUserId' in obj)) {
    errors.push({
      field: 'otherUserId',
      message: 'User ID is required'
    });
  } else if (typeof obj.otherUserId !== 'number') {
    errors.push({
      field: 'otherUserId',
      message: 'User ID must be a number'
    });
  } else if (!Number.isInteger(obj.otherUserId)) {
    errors.push({
      field: 'otherUserId',
      message: 'User ID must be an integer'
    });
  } else if (obj.otherUserId <= 0) {
    errors.push({
      field: 'otherUserId',
      message: 'User ID must be positive'
    });
  }
  
  // Validate itemId (optional)
  if ('itemId' in obj && obj.itemId !== undefined) {
    if (typeof obj.itemId !== 'number') {
      errors.push({
        field: 'itemId',
        message: 'Item ID must be a number'
      });
    } else if (!Number.isInteger(obj.itemId)) {
      errors.push({
        field: 'itemId',
        message: 'Item ID must be an integer'
      });
    } else if (obj.itemId <= 0) {
      errors.push({
        field: 'itemId',
        message: 'Item ID must be positive'
      });
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }
  
  return {
    success: true,
    data: {
      otherUserId: obj.otherUserId as number,
      itemId: obj.itemId as number | undefined
    }
  };
}

/**
 * Pure TypeScript validation for SendMessageCommand
 * 
 * Rules:
 * - conversationId: Required positive integer
 * - content: Required string, trimmed, non-empty, max 4000 characters
 * 
 * @param input Unknown input to validate
 * @returns ValidationResult with parsed data or errors
 */
function validateSendMessageInput(input: unknown): ValidationResult<SendMessageCommand> {
  const errors: ValidationError[] = [];
  
  // Type guard: ensure input is an object
  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: [{
        field: 'root',
        message: 'Input must be an object'
      }]
    };
  }
  
  const obj = input as Record<string, unknown>;
  
  // Validate conversationId
  if (!('conversationId' in obj)) {
    errors.push({
      field: 'conversationId',
      message: 'Conversation ID is required'
    });
  } else if (typeof obj.conversationId !== 'number') {
    errors.push({
      field: 'conversationId',
      message: 'Conversation ID must be a number'
    });
  } else if (!Number.isInteger(obj.conversationId)) {
    errors.push({
      field: 'conversationId',
      message: 'Conversation ID must be an integer'
    });
  } else if (obj.conversationId <= 0) {
    errors.push({
      field: 'conversationId',
      message: 'Conversation ID must be positive'
    });
  }
  
  // Validate content
  let trimmedContent = '';
  if (!('content' in obj)) {
    errors.push({
      field: 'content',
      message: 'Message content is required'
    });
  } else if (typeof obj.content !== 'string') {
    errors.push({
      field: 'content',
      message: 'Message content must be a string'
    });
  } else {
    trimmedContent = obj.content.trim();
    if (trimmedContent.length === 0) {
      errors.push({
        field: 'content',
        message: 'Message content cannot be empty'
      });
    } else if (trimmedContent.length > 4000) {
      errors.push({
        field: 'content',
        message: 'Message content cannot exceed 4000 characters'
      });
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }
  
  return {
    success: true,
    data: {
      conversationId: obj.conversationId as number,
      content: trimmedContent
    }
  };
}

/**
 * Validate StartConversationCommand following SRP
 * 
 * Single Responsibility: Only validates conversation start commands
 * Open/Closed: New validation rules can be added by extending the validation function
 * 
 * @param command Command to validate
 * @returns ValidationResult with parsed data or errors
 * 
 * @example
 * ```typescript
 * const result = validateStartConversation({ otherUserId: 123, itemId: 456 });
 * if (result.success) {
 *   // Use result.data (type-safe StartConversationCommand)
 * } else {
 *   // Handle result.errors (ValidationError[])
 * }
 * ```
 */
export function validateStartConversation(
  command: unknown
): ValidationResult<StartConversationCommand> {
  try {
    return validateStartConversationInput(command);
  } catch (error) {
    // Handle unexpected errors
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Unexpected validation error occurred'
      }]
    };
  }
}

/**
 * Validate SendMessageCommand following SRP
 * 
 * Single Responsibility: Only validates message send commands
 * Open/Closed: New validation rules can be added by extending the validation function
 * 
 * @param command Command to validate
 * @returns ValidationResult with parsed data or errors
 * 
 * @example
 * ```typescript
 * const result = validateSendMessage({ 
 *   conversationId: 123, 
 *   content: '  Hello world!  ' 
 * });
 * if (result.success) {
 *   // result.data.content is automatically trimmed
 * } else {
 *   // Handle result.errors
 * }
 * ```
 */
export function validateSendMessage(
  command: unknown
): ValidationResult<SendMessageCommand> {
  try {
    return validateSendMessageInput(command);
  } catch (error) {
    // Handle unexpected errors
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Unexpected validation error occurred'
      }]
    };
  }
}

/**
 * Type guards for runtime type checking
 * Useful for ensuring type safety at runtime boundaries
 */

/**
 * Type guard to check if validation result is successful
 * Provides type narrowing for TypeScript
 */
export function isValidationSuccess<T>(
  result: ValidationResult<T>
): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard to check if validation result has errors
 * Provides type narrowing for TypeScript
 */
export function isValidationError<T>(
  result: ValidationResult<T>
): result is { success: false; errors: ValidationError[] } {
  return !result.success;
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - validateStartConversation: Only validates conversation start commands
 * - validateSendMessage: Only validates message send commands
 * - validateStartConversationInput: Pure validation logic for start conversation
 * - validateSendMessageInput: Pure validation logic for send message
 * - Each function has one clear validation responsibility
 * 
 * Open/Closed Principle (OCP):
 * - Validation rules are separated into internal functions
 * - New validation rules can be added by extending the validation functions
 * - Error handling is abstracted and can be extended for new error types
 * - Type guards provide extensible type checking
 * 
 * Dependency Inversion Principle (DIP):
 * - No external library dependencies (no Zod, React, Redux, etc.)
 * - Returns structured errors that any presentation layer can use
 * - No assumptions about how errors will be displayed or handled
 * - Pure TypeScript implementation with framework independence
 * 
 * Benefits:
 * - Zero Dependencies: No external validation libraries required
 * - Framework Independence: Works with any UI framework or API layer
 * - Type Safety: Full TypeScript support with discriminated unions
 * - Extensibility: Easy to add new validation rules or error formats
 * - Consistency: Structured error format across all validators
 * - Testability: Pure functions that are easy to unit test
 * - Reusability: Can be used by services, repositories, or UI components
 * - Performance: No external library overhead, pure TypeScript validation
 * 
 * Usage Examples:
 * 
 * // Service layer usage
 * class MessagingService {
 *   async startConversation(command: unknown): Promise<number> {
 *     const validation = validateStartConversation(command);
 *     if (!validation.success) {
 *       throw new ValidationError(validation.errors);
 *     }
 *     return this.repository.startConversation(validation.data);
 *   }
 * }
 * 
 * // UI component usage
 * const handleSubmit = (formData: unknown) => {
 *   const validation = validateSendMessage(formData);
 *   if (validation.success) {
 *     dispatch(sendMessageThunk(validation.data));
 *   } else {
 *     setFormErrors(validation.errors);
 *   }
 * };
 * 
 * // API endpoint usage
 * app.post('/messages', (req, res) => {
 *   const validation = validateSendMessage(req.body);
 *   if (!validation.success) {
 *     return res.status(400).json({ errors: validation.errors });
 *   }
 *   // Process validation.data
 * });
 * 
 * // Type guard usage
 * const result = validateStartConversation(input);
 * if (isValidationSuccess(result)) {
 *   // TypeScript knows result.data is StartConversationCommand
 *   console.log(result.data.otherUserId);
 * } else if (isValidationError(result)) {
 *   // TypeScript knows result.errors is ValidationError[]
 *   result.errors.forEach(error => console.log(error.message));
 * }
 */