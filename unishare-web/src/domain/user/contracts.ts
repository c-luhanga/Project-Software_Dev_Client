/**
 * User Domain Contracts
 * 
 * Pure domain interfaces following SOLID principles:
 * - Dependency Inversion Principle (DIP): Depend on abstractions, not concretions
 * - Interface Segregation Principle (ISP): Small, focused interfaces
 * - Single Responsibility Principle (SRP): Each contract has one clear purpose
 * 
 * Framework Independence:
 * - No React, Vue, Angular dependencies
 * - No HTTP client (axios, fetch) dependencies  
 * - No database/ORM dependencies
 * - Pure TypeScript contracts for maximum portability
 * 
 * Partial Update Philosophy:
 * - Commands support partial updates via optional fields
 * - Only provided fields are processed/validated/updated
 * - Undefined fields preserve existing values
 * - Empty strings are valid updates (field clearing)
 * - Null values indicate intentional field clearing
 */

/**
 * User profile data transfer object
 * Represents complete user profile information
 */
export interface UserProfile {
  readonly userId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly house?: string;
  readonly profileImageUrl?: string;
  readonly isAdmin: boolean;
  readonly createdAt?: Date;
  readonly lastSeen?: Date;
}

/**
 * Command for updating user profile (partial updates supported)
 * 
 * Follows Interface Segregation Principle (ISP):
 * - Contains only mutable profile fields
 * - All fields are optional to support partial updates
 * - Framework-agnostic: no validation, UI, or HTTP concerns
 * 
 * Partial Update Strategy:
 * - Only provided fields will be updated
 * - Undefined/null fields are ignored (not cleared)
 * - Empty strings are treated as valid updates (will clear field)
 * 
 * @example
 * // Update only phone number
 * const cmd1: UpdateProfileCommand = { phone: "555-1234" };
 * 
 * // Update multiple fields
 * const cmd2: UpdateProfileCommand = { 
 *   phone: "555-1234", 
 *   house: "Building A, Room 101" 
 * };
 * 
 * // Clear a field with empty string
 * const cmd3: UpdateProfileCommand = { house: "" };
 */
export interface UpdateProfileCommand {
  /** User's phone number (optional) */
  readonly phone?: string;
  /** User's house/residence information (optional) */
  readonly house?: string;
  /** URL to user's profile image (optional) */
  readonly profileImageUrl?: string;
}

/**
 * Type helper for ensuring at least one field is provided in update commands
 * Prevents empty update commands while maintaining partial update flexibility
 * 
 * @example
 * // Type-safe partial update that requires at least one field
 * function updateProfile(cmd: NonEmptyUpdateCommand) { ... }
 * 
 * // Valid - has at least one field
 * updateProfile({ phone: "555-1234" });
 * 
 * // Invalid - TypeScript error for empty object
 * updateProfile({});
 */
export type NonEmptyUpdateCommand = UpdateProfileCommand & 
  (
    | { phone: string }
    | { house: string }
    | { profileImageUrl: string }
  );

/**
 * Summary information for user's items
 * Lightweight DTO for listing views
 */
export interface ItemSummary {
  readonly itemId: number;
  readonly title: string;
  readonly price?: number;
  readonly statusId: number;
  readonly postedDate: Date;
  readonly thumbnailUrl?: string;
}

/**
 * User repository contract (DIP abstraction)
 * Defines data access operations without implementation details
 */
export interface IUserRepository {
  /**
   * Get current user's profile
   * @returns Promise resolving to user profile
   * @throws Error if user not found or unauthorized
   */
  getMe(): Promise<UserProfile>;

  /**
   * Update current user's profile with partial data
   * 
   * Dependency Inversion Principle (DIP):
   * - Repository abstraction independent of HTTP/database implementation
   * - Framework-agnostic: no axios, fetch, or ORM dependencies
   * 
   * Partial Update Behavior:
   * - Only updates fields present in the command object
   * - Undefined fields are ignored (existing values preserved)
   * - Empty strings are treated as valid updates (will clear field)
   * - Null values are treated as clearing the field
   * 
   * @param command Partial update command with only changed fields
   * @returns Promise<void> indicating operation completion
   * @throws Error if validation fails, unauthorized, or update not permitted
   * 
   * @example
   * // Update only phone
   * await repository.updateMe({ phone: "555-1234" });
   * 
   * // Update multiple fields  
   * await repository.updateMe({ 
   *   phone: "555-1234", 
   *   house: "Building A" 
   * });
   */
  updateMe(command: UpdateProfileCommand): Promise<void>;

  /**
   * Get current user's items
   * @returns Promise resolving to array of item summaries
   * @throws Error if unauthorized or fetch fails
   */
  getMyItems(): Promise<ItemSummary[]>;
}

/**
 * User service contract (DIP abstraction)
 * Defines business operations for user management
 * Segregated interface focusing only on user operations (ISP)
 */
export interface IUserService {
  /**
   * Get current user's profile
   * Handles business logic, validation, and error mapping
   * @returns Promise resolving to user profile
   */
  getProfile(): Promise<UserProfile>;

  /**
   * Update current user's profile with business logic validation
   * 
   * Dependency Inversion Principle (DIP):
   * - Service abstraction independent of presentation/infrastructure layers
   * - Business logic separated from UI and data access concerns
   * 
   * Interface Segregation Principle (ISP):
   * - Focused interface for user profile operations only
   * - No unrelated methods or dependencies
   * 
   * Partial Update Support:
   * - Validates only the fields provided in the command
   * - Applies business rules to changed fields only
   * - Preserves existing values for unspecified fields
   * - Handles edge cases (empty strings, whitespace, etc.)
   * 
   * @param command Partial update command with validated business data
   * @returns Promise<void> indicating successful business operation
   * @throws BusinessLogicError for validation failures
   * @throws AuthorizationError if user cannot perform update
   * 
   * @example
   * // Service validates and processes partial updates
   * await service.updateProfile({ phone: "555-1234" });
   * await service.updateProfile({ house: "", profileImageUrl: "https://..." });
   */
  updateProfile(command: UpdateProfileCommand): Promise<void>;

  /**
   * Get current user's items
   * Returns items owned by the current user
   * @returns Promise resolving to array of item summaries
   */
  getMyItems(): Promise<ItemSummary[]>;
}