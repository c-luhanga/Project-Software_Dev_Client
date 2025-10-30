/**
 * User Domain Contracts
 * 
 * Pure domain interfaces following SOLID principles:
 * - Dependency Inversion Principle (DIP): Depend on abstractions, not concretions
 * - Interface Segregation Principle (ISP): Small, focused interfaces
 * - No framework dependencies - pure TypeScript contracts
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
 * Command for updating user profile
 * Contains only mutable profile fields following ISP
 */
export interface UpdateProfileCommand {
  readonly phone?: string;
  readonly house?: string;
  readonly profileImageUrl?: string;
}

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
   * Update current user's profile
   * @param command Update profile command with new values
   * @throws Error if validation fails or update not permitted
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
   * Update current user's profile
   * Validates command and applies business rules
   * @param command Update profile command
   */
  updateProfile(command: UpdateProfileCommand): Promise<void>;

  /**
   * Get current user's items
   * Returns items owned by the current user
   * @returns Promise resolving to array of item summaries
   */
  getMyItems(): Promise<ItemSummary[]>;
}