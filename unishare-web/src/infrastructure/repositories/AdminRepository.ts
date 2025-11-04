import type { IApiClient } from '../http/IApiClient';

/**
 * Admin Repository - Handles administrative API operations
 * 
 * Follows Repository Pattern and Single Responsibility Principle:
 * - Responsible only for admin-related API calls
 * - Isolated from business logic and UI concerns
 * - Provides clean interface for admin operations
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on abstraction (IApiClient) not concretions
 * - Can be easily mocked for testing
 * - Implementation details hidden from consumers
 */

/**
 * Response type for admin delete item operation
 */
export interface AdminDeleteItemResponse {
  message: string;
  itemId: number;
  adminId: number;
  deletedAt: string;
}

/**
 * Response type for admin ban user operation
 */
export interface AdminBanUserResponse {
  message: string;
  userId: number;
  adminId: number;
  bannedAt: string;
}

/**
 * Admin API error response
 */
export interface AdminApiError {
  message: string;
  details?: string;
}

/**
 * AdminRepository class for handling administrative operations
 * 
 * This repository encapsulates all admin-specific API operations,
 * providing a clean interface for services and thunks to consume.
 * 
 * Benefits:
 * - Centralized admin API logic
 * - Consistent error handling
 * - Easy to test and mock
 * - Clear separation of concerns
 */
export class AdminRepository {
  private readonly apiClient: IApiClient;

  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Delete an item (Admin operation)
   * 
   * @param itemId - ID of the item to delete
   * @returns Promise resolving to delete confirmation
   * @throws {Error} When deletion fails or user lacks permissions
   */
  async deleteItem(itemId: number): Promise<AdminDeleteItemResponse> {
    try {
      const response = await this.apiClient.delete<AdminDeleteItemResponse>(
        `/admin/items/${itemId}`
      );
      
      return response;
    } catch (error: any) {
      // Handle specific HTTP error codes
      if (error.status === 404) {
        throw new Error('Item not found or has already been deleted');
      }
      
      if (error.status === 403) {
        throw new Error('Admin privileges required to delete items');
      }
      
      if (error.status === 401) {
        throw new Error('Authentication required');
      }
      
      // Extract error message from response if available
      const errorMessage = error.message || 'Failed to delete item';
      throw new Error(errorMessage);
    }
  }

  /**
   * Ban a user (Admin operation)
   * 
   * @param userId - ID of the user to ban
   * @returns Promise resolving to ban confirmation
   * @throws {Error} When ban fails or user lacks permissions
   */
  async banUser(userId: number): Promise<AdminBanUserResponse> {
    try {
      const response = await this.apiClient.put<AdminBanUserResponse>(
        `/admin/users/${userId}/ban`
      );
      
      return response;
    } catch (error: any) {
      // Handle specific HTTP error codes
      if (error.status === 404) {
        throw new Error('User not found');
      }
      
      if (error.status === 403) {
        throw new Error('Admin privileges required to ban users');
      }
      
      if (error.status === 401) {
        throw new Error('Authentication required');
      }
      
      // Extract error message from response if available
      const errorMessage = error.message || 'Failed to ban user';
      throw new Error(errorMessage);
    }
  }

  /**
   * Unban a user (Admin operation)
   * 
   * @param userId - ID of the user to unban
   * @returns Promise resolving to unban confirmation
   * @throws {Error} When unban fails or user lacks permissions
   */
  async unbanUser(userId: number): Promise<AdminBanUserResponse> {
    try {
      const response = await this.apiClient.put<AdminBanUserResponse>(
        `/admin/users/${userId}/unban`
      );
      
      return response;
    } catch (error: any) {
      // Handle specific HTTP error codes
      if (error.status === 404) {
        throw new Error('User not found');
      }
      
      if (error.status === 403) {
        throw new Error('Admin privileges required to unban users');
      }
      
      if (error.status === 401) {
        throw new Error('Authentication required');
      }
      
      // Extract error message from response if available
      const errorMessage = error.message || 'Failed to unban user';
      throw new Error(errorMessage);
    }
  }
}

// Factory function for dependency injection
export function createAdminRepository(apiClient: IApiClient): AdminRepository {
  return new AdminRepository(apiClient);
}