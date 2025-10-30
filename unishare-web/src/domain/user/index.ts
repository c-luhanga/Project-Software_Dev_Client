/**
 * User Domain Layer Exports
 * 
 * Complete user domain functionality
 */

// Contracts and interfaces
export type {
  UserProfile,
  UpdateProfileCommand,
  ItemSummary,
  IUserRepository,
  IUserService
} from './contracts';

// Validation
export {
  UserValidationError,
  UserProfileValidator,
  validateUpdateProfile
} from './validators';

export type {
  ValidationResult
} from './validators';

// Services
export {
  UserService,
  createUserService
} from './userService';