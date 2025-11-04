import type { IApiClient } from '../http/IApiClient';

/**
 * Admin Repository - Infrastructure Layer
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for admin-related API operations
 * - No business logic, UI concerns, or state management
 * - Pure data access layer for administrative functions
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Depends on IApiClient abstraction, not concrete implementations
 * - Can be easily tested with mock API clients
 * - Framework-agnostic with no Redux or React dependencies
 * 
 * Clean Architecture Benefits:
 * - Infrastructure layer component with external API concerns
 * - No domain logic mixed with data access
 * - Consistent error handling across all admin operations
 */

/**
 * AdminRepository class for handling administrative API operations
 * 
 * This repository encapsulates all admin-specific HTTP operations,
 * providing a clean interface for domain services to consume.
 * 
 * Key Features:
 * - Type-safe API operations
 * - Consistent error handling and propagation
 * - Framework independence (no React/Redux dependencies)
 * - Easy to mock and test
 * - Clear separation of concerns
 */
export class AdminRepository {
  private readonly apiClient: IApiClient;

  /**
   * Constructor with dependency injection
   * 
   * @param apiClient HTTP client abstraction for API communication
   */
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Delete an item (Admin operation)
   * 
   * Permanently removes an item from the platform. This is an admin-only
   * operation that bypasses normal ownership restrictions.
   * 
   * @param itemId ID of the item to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {Error} When deletion fails, user lacks permissions, or item not found
   * 
   * @example
   * ```typescript
   * try {
   *   await adminRepository.deleteItem(123);
   *   console.log('Item deleted successfully');
   * } catch (error) {
   *   console.error('Delete failed:', error.message);
   * }
   * ```
   */
  async deleteItem(itemId: number): Promise<void> {
    try {
      // Validate input
      if (!itemId || itemId <= 0) {
        throw new Error('Invalid item ID provided');
      }

      // Make DELETE request to admin endpoint
      await this.apiClient.delete(`/admin/items/${itemId}`);
      
      // Operation completed successfully (void return)
    } catch (error: any) {
      // Re-throw with enhanced error information
      this.handleApiError(error, 'delete item');
    }
  }

  /**
   * Ban a user (Admin operation)
   * 
   * Bans a user from the platform, preventing them from logging in or
   * performing actions. This is an admin-only moderation operation.
   * 
   * @param userId ID of the user to ban
   * @returns Promise that resolves when ban is complete
   * @throws {Error} When ban fails, user lacks permissions, or user not found
   * 
   * @example
   * ```typescript
   * try {
   *   await adminRepository.banUser(456);
   *   console.log('User banned successfully');
   * } catch (error) {
   *   console.error('Ban failed:', error.message);
   * }
   * ```
   */
  async banUser(userId: number): Promise<void> {
    try {
      // Validate input
      if (!userId || userId <= 0) {
        throw new Error('Invalid user ID provided');
      }

      // Make POST request to admin ban endpoint
      await this.apiClient.post(`/admin/users/${userId}/ban`);
      
      // Operation completed successfully (void return)
    } catch (error: any) {
      // Re-throw with enhanced error information
      this.handleApiError(error, 'ban user');
    }
  }

  /**
   * Handle API errors with consistent error messaging
   * 
   * Provides centralized error handling for all admin operations.
   * Extracts meaningful error messages and throws appropriate errors.
   * 
   * @param error Original error from API client
   * @param operation Description of the operation that failed
   * @throws {Error} Enhanced error with user-friendly message
   */
  private handleApiError(error: any, operation: string): never {
    // Check for specific HTTP status codes from IApiClient errors
    if (error.status) {
      switch (error.status) {
        case 401:
          throw new Error('Authentication required for admin operations');
        case 403:
          throw new Error('Admin privileges required for this operation');
        case 404:
          throw new Error(`Resource not found - cannot ${operation}`);
        case 409:
          throw new Error(`Conflict occurred - unable to ${operation}`);
        case 500:
          throw new Error(`Server error occurred while trying to ${operation}`);
        default:
          throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
      }
    }

    // Handle network or other errors
    if (error.message) {
      throw new Error(`Failed to ${operation}: ${error.message}`);
    }

    // Fallback error message
    throw new Error(`Failed to ${operation}: Unknown error occurred`);
  }
}

/**
 * Factory function for creating AdminRepository instances
 * 
 * Follows dependency injection pattern for easy testing and configuration.
 * Allows different IApiClient implementations to be injected.
 * 
 * @param apiClient HTTP client implementation
 * @returns Configured AdminRepository instance
 * 
 * @example
 * ```typescript
 * // Production usage
 * import { apiClient } from '../http/axiosClient';
 * const adminRepo = createAdminRepository(apiClient);
 * 
 * // Testing usage
 * const mockClient: IApiClient = { ... };
 * const adminRepo = createAdminRepository(mockClient);
 * ```
 */
export function createAdminRepository(apiClient: IApiClient): AdminRepository {
  return new AdminRepository(apiClient);
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - AdminRepository only handles admin API operations
 * - No UI logic, business rules, or state management
 * - Each method has a single, focused responsibility
 * - Clear separation between API communication and other concerns
 * 
 * Open/Closed Principle (OCP):
 * - Open for extension: New admin operations can be added easily
 * - Closed for modification: Existing methods don't need changes
 * - Error handling strategy can be extended without breaking existing code
 * 
 * Liskov Substitution Principle (LSP):
 * - Can be substituted with any implementation following the same interface
 * - Consistent behavior regardless of IApiClient implementation
 * - Maintains expected contracts for all method signatures
 * 
 * Interface Segregation Principle (ISP):
 * - Depends only on IApiClient interface methods actually used
 * - No unnecessary dependencies on unused interface methods
 * - Clean, minimal interface requirements
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on IApiClient abstraction, not concrete implementations
 * - High-level admin operations don't depend on low-level HTTP details
 * - Easy to test with mock implementations
 * - Framework-independent design
 * 
 * Clean Architecture Benefits:
 * 
 * 1. Framework Independence:
 *    - No React, Redux, or UI framework dependencies
 *    - Can be used in Node.js, web workers, or any JavaScript environment
 *    - Pure TypeScript with minimal external dependencies
 * 
 * 2. Testability:
 *    - Easy to unit test with mock IApiClient implementations
 *    - Predictable error handling behavior
 *    - Clear input validation and output contracts
 * 
 * 3. Maintainability:
 *    - Centralized admin API logic
 *    - Consistent error handling across all operations
 *    - Clear separation of concerns
 * 
 * 4. Type Safety:
 *    - Full TypeScript support with proper error typing
 *    - Input validation with meaningful error messages
 *    - Consistent Promise-based async API
 * 
 * Usage Examples:
 * 
 * // In a domain service
 * class AdminService {
 *   constructor(private adminRepo: AdminRepository) {}
 * 
 *   async moderateItem(itemId: number, adminUserId: number) {
 *     // Business logic validation
 *     if (!this.isValidAdmin(adminUserId)) {
 *       throw new Error('Insufficient permissions');
 *     }
 * 
 *     // Delegate to repository
 *     await this.adminRepo.deleteItem(itemId);
 *   }
 * }
 * 
 * // In a Redux thunk
 * const deleteItemThunk = createAsyncThunk(
 *   'admin/deleteItem',
 *   async (itemId: number, { extra: { container } }) => {
 *     const adminRepo = container.getAdminRepository();
 *     await adminRepo.deleteItem(itemId);
 *   }
 * );
 * 
 * // Testing example
 * describe('AdminRepository', () => {
 *   let mockApiClient: jest.Mocked<IApiClient>;
 *   let adminRepo: AdminRepository;
 * 
 *   beforeEach(() => {
 *     mockApiClient = {
 *       delete: jest.fn(),
 *       post: jest.fn(),
 *       // ... other methods
 *     };
 *     adminRepo = new AdminRepository(mockApiClient);
 *   });
 * 
 *   test('deleteItem calls correct endpoint', async () => {
 *     await adminRepo.deleteItem(123);
 *     expect(mockApiClient.delete).toHaveBeenCalledWith('/admin/items/123');
 *   });
 * 
 *   test('banUser handles errors correctly', async () => {
 *     mockApiClient.post.mockRejectedValue({ status: 403 });
 *     await expect(adminRepo.banUser(456)).rejects.toThrow('Admin privileges required');
 *   });
 * });
 */