/**
 * Domain Layer Exports
 * 
 * Centralized exports for domain contracts and types
 * Following Clean Architecture principles
 */

// User domain contracts
export type {
  UserProfile,
  UpdateProfileCommand,
  NonEmptyUpdateCommand,
  ItemSummary,
  IUserRepository,
  IUserService
} from './user/contracts';

// User domain validation
export {
  UserValidationError,
  UserProfileValidator,
  validateUpdateProfile
} from './user/validators';

export type {
  ValidationResult,
  ValidationError
} from './user/validators';

// User domain services
export {
  UserService,
  createUserService
} from './user/userService';