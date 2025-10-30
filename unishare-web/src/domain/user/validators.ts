import type { UpdateProfileCommand } from './contracts';

/**
 * Domain validation error for user profile operations
 * Provides structured error information following domain patterns
 */
export class UserValidationError extends Error {
  public readonly field: keyof UpdateProfileCommand;
  public readonly code: string;

  constructor(
    message: string,
    field: keyof UpdateProfileCommand,
    code: string
  ) {
    super(message);
    this.name = 'UserValidationError';
    this.field = field;
    this.code = code;
  }
}

/**
 * Validation result type for type-safe error handling
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: UserValidationError[];
};

/**
 * User profile validator following Single Responsibility and Open/Closed Principles
 * 
 * Responsibilities:
 * - Validate UpdateProfileCommand fields according to business rules
 * - Return structured errors for UI consumption
 * - Maintain pure domain logic without framework dependencies
 * 
 * OCP: Easy to extend with new validation rules without modifying existing code
 * SRP: Focused solely on user profile validation
 */
export class UserProfileValidator {
  private readonly phoneMinLength = 7;
  private readonly phoneMaxLength = 20;
  private readonly houseMinLength = 2;
  private readonly houseMaxLength = 40;

  /**
   * Validates UpdateProfileCommand and returns typed result
   * @param command The profile update command to validate
   * @returns ValidationResult with parsed data or structured errors
   */
  validateUpdateProfile(command: UpdateProfileCommand): ValidationResult<UpdateProfileCommand> {
    const errors: UserValidationError[] = [];

    // Validate phone field
    if (command.phone !== undefined) {
      const phoneErrors = this.validatePhone(command.phone);
      errors.push(...phoneErrors);
    }

    // Validate house field
    if (command.house !== undefined) {
      const houseErrors = this.validateHouse(command.house);
      errors.push(...houseErrors);
    }

    // Validate profile image URL
    if (command.profileImageUrl !== undefined) {
      const urlErrors = this.validateProfileImageUrl(command.profileImageUrl);
      errors.push(...urlErrors);
    }

    // Return result
    if (errors.length === 0) {
      return {
        success: true,
        data: command
      };
    }

    return {
      success: false,
      errors
    };
  }

  /**
   * Validate phone number according to business rules
   * OCP: Can be extended with more specific phone validation rules
   */
  private validatePhone(phone: string): UserValidationError[] {
    const errors: UserValidationError[] = [];

    if (phone.trim().length === 0) {
      errors.push(new UserValidationError(
        'Phone number cannot be empty when provided',
        'phone',
        'EMPTY_VALUE'
      ));
      return errors;
    }

    if (phone.length < this.phoneMinLength) {
      errors.push(new UserValidationError(
        `Phone number must be at least ${this.phoneMinLength} characters`,
        'phone',
        'MIN_LENGTH'
      ));
    }

    if (phone.length > this.phoneMaxLength) {
      errors.push(new UserValidationError(
        `Phone number must not exceed ${this.phoneMaxLength} characters`,
        'phone',
        'MAX_LENGTH'
      ));
    }

    // Basic phone format validation (digits, spaces, hyphens, parentheses, plus)
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(phone)) {
      errors.push(new UserValidationError(
        'Phone number contains invalid characters',
        'phone',
        'INVALID_FORMAT'
      ));
    }

    return errors;
  }

  /**
   * Validate house field according to business rules
   * OCP: Can be extended with house-specific validation (e.g., valid house names)
   */
  private validateHouse(house: string): UserValidationError[] {
    const errors: UserValidationError[] = [];

    if (house.trim().length === 0) {
      errors.push(new UserValidationError(
        'House name cannot be empty when provided',
        'house',
        'EMPTY_VALUE'
      ));
      return errors;
    }

    if (house.length < this.houseMinLength) {
      errors.push(new UserValidationError(
        `House name must be at least ${this.houseMinLength} characters`,
        'house',
        'MIN_LENGTH'
      ));
    }

    if (house.length > this.houseMaxLength) {
      errors.push(new UserValidationError(
        `House name must not exceed ${this.houseMaxLength} characters`,
        'house',
        'MAX_LENGTH'
      ));
    }

    return errors;
  }

  /**
   * Validate profile image URL according to business rules
   * OCP: Can be extended with more specific URL validation (file types, domains, etc.)
   */
  private validateProfileImageUrl(profileImageUrl: string): UserValidationError[] {
    const errors: UserValidationError[] = [];

    if (profileImageUrl.trim().length === 0) {
      errors.push(new UserValidationError(
        'Profile image URL cannot be empty when provided',
        'profileImageUrl',
        'EMPTY_VALUE'
      ));
      return errors;
    }

    // Validate as absolute URL
    try {
      const url = new URL(profileImageUrl);
      
      // Must be HTTP or HTTPS
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push(new UserValidationError(
          'Profile image URL must use HTTP or HTTPS protocol',
          'profileImageUrl',
          'INVALID_PROTOCOL'
        ));
      }

      // Basic file extension check for images
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = validExtensions.some(ext => 
        url.pathname.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        errors.push(new UserValidationError(
          'Profile image URL must point to a valid image file (.jpg, .jpeg, .png, .gif, .webp)',
          'profileImageUrl',
          'INVALID_FILE_TYPE'
        ));
      }

    } catch {
      errors.push(new UserValidationError(
        'Profile image URL must be a valid absolute URL',
        'profileImageUrl',
        'INVALID_URL_FORMAT'
      ));
    }

    return errors;
  }
}

/**
 * Convenience function for validation following functional programming patterns
 * @param command The update profile command to validate
 * @returns ValidationResult with typed success/error information
 */
export function validateUpdateProfile(command: UpdateProfileCommand): ValidationResult<UpdateProfileCommand> {
  const validator = new UserProfileValidator();
  return validator.validateUpdateProfile(command);
}