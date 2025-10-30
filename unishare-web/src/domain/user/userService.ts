/**
 * User Service Implementation (Domain Layer)
 * 
 * Implements IUserService contract following SOLID principles:
 * - SRP: Single responsibility for user business operations and orchestration
 * - OCP: Open for extension (new business rules) without modification
 * - DIP: Depends only on IUserRepository abstraction, not infrastructure details
 * 
 * Pure domain layer - no HTTP, UI, or framework dependencies
 */

import type { IUserService, IUserRepository, UserProfile, UpdateProfileCommand, ItemSummary } from './contracts';
import { validateUpdateProfile } from './validators';

/**
 * Domain service implementing user business operations
 * Orchestrates validation, business rules, and data access
 */
export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Get current user's profile
   * Handles business logic, validation, and error mapping
   * @returns Promise resolving to user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      // Delegate to repository - service adds business logic layer
      const profile = await this.userRepository.getMe();
      
      // Future business rules can be added here (OCP):
      // - Profile completion checks
      // - Privacy settings validation
      // - Account status verification
      // - Audit logging
      
      return profile;
    } catch (error) {
      // Domain-level error transformation
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve user profile: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while retrieving your profile');
    }
  }

  /**
   * Update current user's profile
   * Validates command and applies business rules before delegation
   * @param command Update profile command
   */
  async updateProfile(command: UpdateProfileCommand): Promise<void> {
    try {
      // Domain validation first (business rule enforcement)
      const validationResult = validateUpdateProfile(command);
      
      if (!validationResult.success) {
        // Transform validation errors to business exception
        const errorMessages = validationResult.errors.map(e => e.message);
        throw new Error(`Profile validation failed: ${errorMessages.join(', ')}`);
      }

      // Future business rules can be added here (OCP):
      // - Profile change frequency limits
      // - Admin approval requirements for certain fields
      // - Profile image content validation
      // - Notification triggers for profile changes
      // - Data privacy compliance checks

      // Delegate to repository with validated data
      await this.userRepository.updateMe(validationResult.data);

      // Future post-update operations (OCP):
      // - Send notification emails
      // - Update search indexes
      // - Log audit trail
      // - Clear related caches

    } catch (error) {
      // Domain-level error transformation
      if (error instanceof Error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while updating your profile');
    }
  }

  /**
   * Get current user's items
   * Returns items owned by the current user with business logic applied
   * @returns Promise resolving to array of item summaries
   */
  async getMyItems(): Promise<ItemSummary[]> {
    try {
      // Delegate to repository
      const items = await this.userRepository.getMyItems();

      // Future business rules can be added here (OCP):
      // - Filter items based on user permissions
      // - Sort by business priority (featured items first)
      // - Add computed fields (time since posted, urgency)
      // - Apply user preferences (hide certain categories)
      // - Include recommendation scores

      return items;
    } catch (error) {
      // Domain-level error transformation
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve your items: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while retrieving your items');
    }
  }
}

/**
 * Factory function for dependency injection
 * Follows DIP by accepting repository abstraction
 */
export function createUserService(userRepository: IUserRepository): IUserService {
  return new UserService(userRepository);
}

/*
 * Extension Points for Future Business Rules (OCP Compliance):
 * 
 * 1. Profile Validation Extensions:
 *    - Custom validation rules per user type (student, faculty, admin)
 *    - Institution-specific profile requirements
 *    - Progressive profile completion requirements
 * 
 * 2. Profile Update Extensions:
 *    - Approval workflows for sensitive fields
 *    - Rate limiting and change frequency controls
 *    - Automated data enrichment (geocoding for addresses)
 *    - Integration with external identity providers
 * 
 * 3. Items Retrieval Extensions:
 *    - Personalized sorting algorithms
 *    - Business intelligence and analytics
 *    - Performance optimization (caching, pagination)
 *    - Cross-selling and recommendation engines
 * 
 * 4. Cross-Cutting Concerns:
 *    - Audit logging and compliance tracking
 *    - Performance monitoring and metrics
 *    - Event sourcing for state changes
 *    - Integration with notification systems
 */

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - UserService has one responsibility: user business operations orchestration
 * - Validation logic is separated into validators
 * - Data access is separated into repository
 * - Each method has a focused, single purpose
 * 
 * Open/Closed Principle (OCP):
 * - Open for extension: Clear extension points marked for future business rules
 * - Closed for modification: Core orchestration logic doesn't need changes
 * - New validation rules can be added without changing existing code
 * - New business logic can be inserted at designated extension points
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on IUserRepository abstraction, not concrete implementation
 * - No knowledge of HTTP, database, or infrastructure details
 * - Repository implementation can be swapped without changes
 * - Pure domain layer with no external dependencies
 */