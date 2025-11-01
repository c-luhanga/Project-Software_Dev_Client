/**
 * Example Integration with Existing Error Handling System
 * 
 * Demonstrates how UserProfileValidator integrates with your existing
 * error handling system and auth validation patterns
 */

import { validateUpdateProfile } from './validators';
import { type UpdateProfileCommand } from './contracts';
import { mapError } from '../../utils/errorMapper';

/**
 * Example service method showing validation integration
 * Follows the same pattern as your existing auth validation
 */
export class UserService {
  async updateProfile(command: UpdateProfileCommand): Promise<void> {
    // Domain validation (pure, no side effects)
    const validationResult = validateUpdateProfile(command);
    
    if (!validationResult.success) {
      // Convert domain validation errors to UI-friendly format
      const uiErrors = validationResult.errors.map(error => ({
        field: error.field,
        message: error.message
      }));
      
      // Throw structured error that matches your existing error handling
      throw new Error(`Validation failed: ${JSON.stringify(uiErrors)}`);
    }

    // Proceed with API call using validated data
    try {
      await this.apiUpdateProfile(validationResult.data);
    } catch (error) {
      // Use your existing error mapper for API errors
      const mappedError = mapError(error);
      throw mappedError;
    }
  }

  private async apiUpdateProfile(_command: UpdateProfileCommand): Promise<void> {
    // API call implementation
  }
}

/**
 * Example React component usage
 * Shows how validation errors can be displayed using your ErrorDisplay component
 */
export function useProfileValidation() {
  const validateAndUpdate = (command: UpdateProfileCommand) => {
    const result = validateUpdateProfile(command);
    
    if (!result.success) {
      // Return errors in format compatible with your ErrorDisplay component
      return {
        hasErrors: true,
        errors: result.errors.map(error => ({
          field: error.field,
          message: error.message,
          category: 'validation' as const,
          retryable: false
        }))
      };
    }

    return {
      hasErrors: false,
      validatedData: result.data
    };
  };

  return { validateAndUpdate };
}

/*
 * Benefits of this approach vs. Zod:
 * 
 * 1. Consistent with Your Architecture:
 *    - Matches your AuthValidator pattern
 *    - Same error structure and handling
 *    - Pure domain logic, no framework coupling
 * 
 * 2. Type Safety:
 *    - Custom typed errors with field mapping
 *    - ValidationResult type prevents invalid access
 *    - Integrates with your existing TypeScript types
 * 
 * 3. SOLID Principles:
 *    - SRP: UserProfileValidator has single responsibility
 *    - OCP: Easy to extend without modifying existing code
 *    - DIP: No external dependencies, pure domain logic
 * 
 * 4. Performance:
 *    - No additional bundle size from Zod
 *    - Custom validation = exact business rules
 *    - Lightweight error objects
 * 
 * 5. Maintainability:
 *    - Follows patterns your team already knows
 *    - Easy to debug with custom error types
 *    - Clear business rule documentation
 */