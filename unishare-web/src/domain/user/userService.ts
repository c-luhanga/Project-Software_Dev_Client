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
import { validateUpdateProfile, UserValidationError } from './validators';

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
   * Update current user's profile with comprehensive validation and orchestration
   * 
   * Service Orchestration (SRP):
   * - Validates command using domain validation rules
   * - Applies business rules and transformations
   * - Delegates to repository for persistence
   * - Maintains clean error boundaries
   * 
   * Extensibility (OCP):
   * - Business rules can be added without changing callers
   * - Validation can be enhanced without interface changes
   * - Post-processing hooks ready for future features
   * 
   * @param command Update profile command with new values
   * @throws UserValidationError for validation failures with structured error details
   * @throws Error for repository/infrastructure failures (not swallowed)
   * @returns Promise<void> indicating successful completion
   */
  async updateProfile(command: UpdateProfileCommand): Promise<void> {
    // Step 1: Domain validation (business rule enforcement)
    const validationResult = validateUpdateProfile(command);
    
    if (!validationResult.success) {
      // Create structured domain validation error
      const errorDetails = validationResult.errors
        .map(e => `${e.field}: ${e.message}`)
        .join(', ');
      
      throw new UserValidationError(
        `Profile validation failed: ${errorDetails}`,
        'profile' as keyof UpdateProfileCommand,
        'VALIDATION_FAILED'
      );
    }

    // Step 2: Business rule processing (OCP extension point)
    const processedCommand = await this.applyBusinessRules(validationResult.data);

    // Step 3: Repository delegation (do not swallow errors)
    await this.userRepository.updateMe(processedCommand);

    // Step 4: Post-update operations (OCP extension point)
    await this.performPostUpdateOperations(processedCommand);
  }

  /**
   * Apply business rules and data transformations (OCP extension point)
   * 
   * Future extensions without modifying callers:
   * - Phone number normalization (format standardization)
   * - House name standardization (building code lookup)
   * - Profile image URL validation and optimization
   * - Data enrichment (address geocoding, phone carrier lookup)
   * - Privacy settings application
   * - User type-specific field processing
   * 
   * @param command Validated update command
   * @returns Promise<UpdateProfileCommand> with business rules applied
   */
  private async applyBusinessRules(command: UpdateProfileCommand): Promise<UpdateProfileCommand> {
    // Currently pass-through, but ready for business rule extensions
    let processedCommand = { ...command };

    // Future business rules (examples):
    // if (processedCommand.phone) {
    //   processedCommand.phone = await this.normalizePhoneNumber(processedCommand.phone);
    // }
    // 
    // if (processedCommand.house) {
    //   processedCommand.house = await this.standardizeHouseName(processedCommand.house);
    // }
    //
    // if (processedCommand.profileImageUrl) {
    //   processedCommand.profileImageUrl = await this.optimizeImageUrl(processedCommand.profileImageUrl);
    // }

    return processedCommand;
  }

  /**
   * Perform post-update operations (OCP extension point)
   * 
   * Future extensions without modifying callers:
   * - Send notification emails for profile changes
   * - Update search indexes with new profile data
   * - Log audit trail for compliance tracking
   * - Clear related caches (profile cache, user cache)
   * - Trigger webhooks for external system integration
   * - Update derived data (user score, completeness metrics)
   * 
   * @param _command The successfully processed command (reserved for future extensions)
   */
  private async performPostUpdateOperations(_command: UpdateProfileCommand): Promise<void> {
    // Currently no-op, but ready for post-update extensions
    
    // Future post-update operations (examples):
    // await this.notificationService.sendProfileUpdateEmail(_command);
    // await this.searchIndexService.updateUserProfile(_command);
    // await this.auditService.logProfileUpdate(_command);
    // await this.cacheService.invalidateUserCache();
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