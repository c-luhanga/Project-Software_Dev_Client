import type { AdminDashboardData, AdminUsersList, UserSearchOptions } from './types';

/**
 * Admin Domain Contracts
 * 
 * Defines interfaces and types for the admin domain layer.
 * Follows Interface Segregation Principle by providing minimal,
 * focused interfaces for different admin operations.
 */

/**
 * Repository interface for admin operations
 * 
 * Abstracts data access for administrative operations.
 * Allows different implementations (HTTP, database, mock, etc.)
 */
export interface IAdminRepository {
  /**
   * Get admin dashboard overview data
   * @returns Promise that resolves to dashboard statistics
   */
  getDashboard(): Promise<AdminDashboardData>;

  /**
   * Get paginated list of users for admin management
   * @param options Search and pagination options
   * @returns Promise that resolves to paginated user list
   */
  getUsers(options?: UserSearchOptions): Promise<AdminUsersList>;

  /**
   * Delete an item by ID
   * @param itemId ID of the item to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteItem(itemId: number): Promise<void>;

  /**
   * Ban a user by ID
   * @param userId ID of the user to ban
   * @returns Promise that resolves when ban is complete
   */
  banUser(userId: number): Promise<void>;

  /**
   * Unban a user by ID
   * @param userId ID of the user to unban
   * @returns Promise that resolves when unban is complete
   */
  unbanUser(userId: number): Promise<void>;
}

/**
 * Service interface for admin business logic
 * 
 * Defines the contract for admin domain services.
 * Includes validation, business rules, and error handling.
 */
export interface IAdminService {
  /**
   * Get admin dashboard overview with business validation
   * @returns Promise that resolves to dashboard statistics
   */
  getDashboard(): Promise<AdminDashboardData>;

  /**
   * Get paginated list of users for admin management with business validation
   * @param options Search and pagination options
   * @returns Promise that resolves to paginated user list
   */
  getUsers(options?: UserSearchOptions): Promise<AdminUsersList>;

  /**
   * Delete an item with business validation
   * @param itemId ID of the item to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteItem(itemId: number): Promise<void>;

  /**
   * Ban a user with business validation
   * @param userId ID of the user to ban
   * @returns Promise that resolves when ban is complete
   */
  banUser(userId: number): Promise<void>;

  /**
   * Unban a user with business validation
   * @param userId ID of the user to unban
   * @returns Promise that resolves when unban is complete
   */
  unbanUser(userId: number): Promise<void>;
}

/**
 * Admin operation result types
 */
export interface AdminOperationResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

export interface AdminDeleteResult extends AdminOperationResult {
  itemId: number;
}

export interface AdminBanResult extends AdminOperationResult {
  userId: number;
}