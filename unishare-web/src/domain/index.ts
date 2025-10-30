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
  ItemSummary,
  IUserRepository,
  IUserService
} from './user/contracts';