import type { IApiClient } from '../http/IApiClient';
import type { AdminUsersList, UserSearchOptions, AdminDashboardData } from '../../domain/admin/types';

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
   * Get paginated list of users for admin management
   * 
   * @param options - Search and pagination options
   * @returns Promise resolving to paginated user list
   * @throws {Error} When request fails or user lacks permissions
   */
  async getUsers(options: UserSearchOptions = {}): Promise<AdminUsersList> {
    try {
      const params = new URLSearchParams();
      
      if (options.searchTerm) params.append('search', options.searchTerm);
      if (options.includeAdmins !== undefined) params.append('includeAdmins', String(options.includeAdmins));
      if (options.includeBanned !== undefined) params.append('includeBanned', String(options.includeBanned));
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.page) params.append('page', String(options.page));
      if (options.pageSize) params.append('pageSize', String(options.pageSize));
      
      const queryString = params.toString();
      const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
      
      const response = await this.apiClient.get<AdminUsersList>(url);
      
      return response;
    } catch (error: any) {
      // Handle specific HTTP error codes
      if (error.status === 403) {
        throw new Error('Admin privileges required to view user list');
      }
      
      if (error.status === 401) {
        throw new Error('Authentication required');
      }
      
      // Extract error message from response if available
      const errorMessage = error.message || 'Failed to fetch users';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get admin dashboard overview data
   * 
   * @returns Promise resolving to dashboard statistics
   * @throws {Error} When request fails or user lacks permissions
   */
  async getDashboard(): Promise<AdminDashboardData> {
    try {
      const response = await this.apiClient.get<AdminDashboardData>('/admin/dashboard');
      
      return response;
    } catch (error: any) {
      // Handle specific HTTP error codes
      if (error.status === 403) {
        throw new Error('Admin privileges required to view dashboard');
      }
      
      if (error.status === 401) {
        throw new Error('Authentication required');
      }
      
      // Extract error message from response if available
      const errorMessage = error.message || 'Failed to fetch dashboard data';
      throw new Error(errorMessage);
    }
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