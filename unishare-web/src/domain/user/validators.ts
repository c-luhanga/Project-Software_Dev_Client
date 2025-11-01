import type { UpdateProfileCommand } from './contracts';

/**
 * Normalized validation error format for consistent error handling
 * Framework-agnostic structure suitable for any presentation layer
 */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

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

  /**
   * Convert to normalized error format
   */
  toNormalizedError(): ValidationError {
    return {
      field: this.field,
      message: this.message
    };
  }
}

/**
 * Validation result type for type-safe error handling
 * Enhanced to include normalized command with trimmed/cleaned data
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: ValidationError[];
};

/**
 * Processing result for individual field validation
 * Used internally by validator to track normalized values and errors
 */
interface FieldProcessResult {
  value: string | null;
  errors: UserValidationError[];
}

/**
 * User profile validator following Single Responsibility and Open/Closed Principles
 * 
 * Responsibilities:
 * - Validate and normalize UpdateProfileCommand fields according to business rules
 * - Trim whitespace and omit empty fields from final command
 * - Return structured errors in normalized format for framework-agnostic consumption
 * - Maintain pure domain logic without UI/framework dependencies
 * 
 * Strengthened Validation Rules:
 * - Phone: 7-20 characters after trimming, allows digits, spaces, hyphens, parentheses, plus
 * - House: 2-40 characters after trimming, any printable characters
 * - ProfileImageUrl: Must be valid absolute HTTP/HTTPS URL pointing to image file
 * - Empty fields: Omitted from final command (not saved as empty strings)
 * 
 * OCP: Easy to extend with new validation rules without modifying existing code
 * SRP: Focused solely on user profile validation and normalization
 */
export class UserProfileValidator {
  private readonly phoneMinLength = 7;
  private readonly phoneMaxLength = 20;
  private readonly houseMinLength = 2;
  private readonly houseMaxLength = 40;

  /**
   * Validates and normalizes UpdateProfileCommand
   * Trims strings, validates according to business rules, omits empty fields
   * 
   * @param command The profile update command to validate
   * @returns ValidationResult with normalized data or structured error map
   */
  validateUpdateProfile(command: UpdateProfileCommand): ValidationResult<UpdateProfileCommand> {
    const errors: UserValidationError[] = [];
    const normalizedFields: Record<string, string> = {};

    // Process and validate phone field
    if (command.phone !== undefined) {
      const phoneResult = this.processPhone(command.phone);
      if (phoneResult.errors.length > 0) {
        errors.push(...phoneResult.errors);
      } else if (phoneResult.value !== null) {
        normalizedFields.phone = phoneResult.value;
      }
      // If value is null (empty after trim), field is omitted from final command
    }

    // Process and validate house field
    if (command.house !== undefined) {
      const houseResult = this.processHouse(command.house);
      if (houseResult.errors.length > 0) {
        errors.push(...houseResult.errors);
      } else if (houseResult.value !== null) {
        normalizedFields.house = houseResult.value;
      }
      // If value is null (empty after trim), field is omitted from final command
    }

    // Process and validate profile image URL
    if (command.profileImageUrl !== undefined) {
      const urlResult = this.processProfileImageUrl(command.profileImageUrl);
      if (urlResult.errors.length > 0) {
        errors.push(...urlResult.errors);
      } else if (urlResult.value !== null) {
        normalizedFields.profileImageUrl = urlResult.value;
      }
      // If value is null (empty after trim), field is omitted from final command
    }

    // Return validation result
    if (errors.length === 0) {
      return {
        success: true,
        data: normalizedFields as UpdateProfileCommand
      };
    }

    return {
      success: false,
      errors: errors.map(error => error.toNormalizedError())
    };
  }

  /**
   * Process and validate phone field
   * Trims input, validates length and format, returns normalized value or null if empty
   */
  private processPhone(phone: string): FieldProcessResult {
    const trimmed = phone.trim();
    const errors: UserValidationError[] = [];

    // If empty after trim, omit field (return null)
    if (trimmed.length === 0) {
      return { value: null, errors: [] };
    }

    // Validate length constraints
    if (trimmed.length < this.phoneMinLength) {
      errors.push(new UserValidationError(
        `Phone number must be at least ${this.phoneMinLength} characters`,
        'phone',
        'MIN_LENGTH'
      ));
    }

    if (trimmed.length > this.phoneMaxLength) {
      errors.push(new UserValidationError(
        `Phone number must not exceed ${this.phoneMaxLength} characters`,
        'phone',
        'MAX_LENGTH'
      ));
    }

    // Validate format (digits, spaces, hyphens, parentheses, plus)
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(trimmed)) {
      errors.push(new UserValidationError(
        'Phone number can only contain digits, spaces, hyphens, parentheses, and plus signs',
        'phone',
        'INVALID_FORMAT'
      ));
    }

    return {
      value: errors.length === 0 ? trimmed : null,
      errors
    };
  }

  /**
   * Process and validate house field
   * Trims input, validates length, returns normalized value or null if empty
   */
  private processHouse(house: string): FieldProcessResult {
    const trimmed = house.trim();
    const errors: UserValidationError[] = [];

    // If empty after trim, omit field (return null)
    if (trimmed.length === 0) {
      return { value: null, errors: [] };
    }

    // Validate length constraints
    if (trimmed.length < this.houseMinLength) {
      errors.push(new UserValidationError(
        `House information must be at least ${this.houseMinLength} characters`,
        'house',
        'MIN_LENGTH'
      ));
    }

    if (trimmed.length > this.houseMaxLength) {
      errors.push(new UserValidationError(
        `House information must not exceed ${this.houseMaxLength} characters`,
        'house',
        'MAX_LENGTH'
      ));
    }

    // House can contain any printable characters (no additional format validation)

    return {
      value: errors.length === 0 ? trimmed : null,
      errors
    };
  }

  /**
   * Process and validate profile image URL
   * Trims input, validates as absolute HTTP/HTTPS URL with image file extension
   */
  private processProfileImageUrl(profileImageUrl: string): FieldProcessResult {
    const trimmed = profileImageUrl.trim();
    const errors: UserValidationError[] = [];

    // If empty after trim, omit field (return null)
    if (trimmed.length === 0) {
      return { value: null, errors: [] };
    }

    // Validate as absolute URL
    try {
      const url = new URL(trimmed);
      
      // Must be HTTP or HTTPS protocol
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push(new UserValidationError(
          'Profile image URL must use HTTP or HTTPS protocol',
          'profileImageUrl',
          'INVALID_PROTOCOL'
        ));
      }

      // Must point to image file (validate file extension)
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const hasValidExtension = validExtensions.some(ext => 
        url.pathname.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        errors.push(new UserValidationError(
          'Profile image URL must point to a valid image file (.jpg, .jpeg, .png, .gif, .webp, .bmp, .svg)',
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

    return {
      value: errors.length === 0 ? trimmed : null,
      errors
    };
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