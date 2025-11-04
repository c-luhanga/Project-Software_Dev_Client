import type { IAdminRepository, IAdminService } from './contracts';

/**
 * Domain Admin Service - Business Logic Layer
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for admin business logic and validation
 * - Delegates data access to AdminRepository
 * - Handles domain-specific validation rules
 * 
 * Follows Open/Closed Principle (OCP):
 * - Open for extension: New admin operations can be added
 * - Closed for modification: Existing operations remain stable
 * - Error handling strategy can be extended without breaking changes
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Depends on AdminRepository abstraction, not concrete implementations
 * - High-level domain logic doesn't depend on infrastructure details
 * - Easy to test with mock repositories
 * 
 * Clean Architecture Benefits:
 * - Domain layer component with business rules
 * - No infrastructure concerns (HTTP, databases, frameworks)
 * - Pure business logic with typed domain errors
 */

/**
 * Domain error types for admin operations
 * 
 * Provides strongly-typed errors for different failure scenarios.
 * Allows consumers to handle specific error conditions appropriately.
 */

/**
 * Base class for all admin domain errors
 */
export abstract class AdminDomainError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'validation' | 'authorization' | 'business' | 'infrastructure';
  
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

/**
 * Validation errors for invalid input parameters
 */
export class AdminValidationError extends AdminDomainError {
  readonly code = 'ADMIN_VALIDATION_ERROR';
  readonly category = 'validation' as const;
  public readonly field?: string;

  constructor(message: string, field?: string, details?: unknown) {
    super(message, details);
    this.field = field;
  }
}

/**
 * Authorization errors for insufficient permissions
 */
export class AdminAuthorizationError extends AdminDomainError {
  readonly code = 'ADMIN_AUTHORIZATION_ERROR';
  readonly category = 'authorization' as const;
}

/**
 * Business rule violations
 */
export class AdminBusinessRuleError extends AdminDomainError {
  readonly code = 'ADMIN_BUSINESS_RULE_ERROR';
  readonly category = 'business' as const;
}

/**
 * Infrastructure/external service errors
 */
export class AdminInfrastructureError extends AdminDomainError {
  readonly code = 'ADMIN_INFRASTRUCTURE_ERROR';
  readonly category = 'infrastructure' as const;
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message, originalError);
    this.originalError = originalError;
  }
}

/**
 * AdminService class for domain-level admin operations
 * 
 * This service encapsulates business logic for administrative operations,
 * providing validation, error handling, and domain-specific rules.
 * 
 * Key Responsibilities:
 * - Input validation with business rules
 * - Typed domain error handling
 * - Coordination between different repositories (future extensibility)
 * - Business logic enforcement
 * - Audit logging (future extension)
 */
export class AdminService implements IAdminService {
  private readonly adminRepository: IAdminRepository;

  /**
   * Constructor with dependency injection
   * 
   * @param adminRepository Repository for admin data operations
   */
  constructor(adminRepository: IAdminRepository) {
    this.adminRepository = adminRepository;
  }

  /**
   * Delete an item with business validation
   * 
   * Performs domain-level validation before delegating to repository.
   * Ensures business rules are enforced consistently.
   * 
   * Business Rules:
   * - Item ID must be a positive integer
   * - Item must exist in the system
   * - Admin must have delete permissions (handled by repository/auth)
   * 
   * @param itemId ID of the item to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {AdminValidationError} When itemId is invalid
   * @throws {AdminInfrastructureError} When repository operation fails
   * @throws {AdminAuthorizationError} When user lacks permissions
   * 
   * @example
   * ```typescript
   * try {
   *   await adminService.deleteItem(123);
   *   console.log('Item deleted successfully');
   * } catch (error) {
   *   if (error instanceof AdminValidationError) {
   *     console.error('Invalid input:', error.message);
   *   } else if (error instanceof AdminAuthorizationError) {
   *     console.error('Permission denied:', error.message);
   *   }
   * }
   * ```
   */
  async deleteItem(itemId: number): Promise<void> {
    // Domain validation
    this.validateItemId(itemId);

    try {
      // Delegate to repository for data operation
      await this.adminRepository.deleteItem(itemId);
    } catch (error) {
      // Transform infrastructure errors to domain errors
      this.handleRepositoryError(error, 'delete item');
    }
  }

  /**
   * Ban a user with business validation
   * 
   * Performs domain-level validation before delegating to repository.
   * Ensures business rules are enforced consistently.
   * 
   * Business Rules:
   * - User ID must be a positive integer
   * - User must exist in the system
   * - Cannot ban system admin users (future extension)
   * - Admin must have ban permissions (handled by repository/auth)
   * 
   * @param userId ID of the user to ban
   * @returns Promise that resolves when ban is complete
   * @throws {AdminValidationError} When userId is invalid
   * @throws {AdminInfrastructureError} When repository operation fails
   * @throws {AdminAuthorizationError} When user lacks permissions
   * @throws {AdminBusinessRuleError} When business rules are violated
   * 
   * @example
   * ```typescript
   * try {
   *   await adminService.banUser(456);
   *   console.log('User banned successfully');
   * } catch (error) {
   *   if (error instanceof AdminValidationError) {
   *     console.error('Invalid user ID:', error.message);
   *   } else if (error instanceof AdminBusinessRuleError) {
   *     console.error('Business rule violation:', error.message);
   *   }
   * }
   * ```
   */
  async banUser(userId: number): Promise<void> {
    // Domain validation
    this.validateUserId(userId);

    // Business rule validation (extensible)
    this.validateBanBusinessRules(userId);

    try {
      // Delegate to repository for data operation
      await this.adminRepository.banUser(userId);
    } catch (error) {
      // Transform infrastructure errors to domain errors
      this.handleRepositoryError(error, 'ban user');
    }
  }

  /**
   * Validate item ID according to domain rules
   * 
   * @param itemId Item ID to validate
   * @throws {AdminValidationError} When validation fails
   */
  private validateItemId(itemId: number): void {
    if (itemId === null || itemId === undefined) {
      throw new AdminValidationError(
        'Item ID is required',
        'itemId',
        { provided: itemId }
      );
    }

    if (!Number.isInteger(itemId)) {
      throw new AdminValidationError(
        'Item ID must be an integer',
        'itemId',
        { provided: itemId, type: typeof itemId }
      );
    }

    if (itemId <= 0) {
      throw new AdminValidationError(
        'Item ID must be a positive integer',
        'itemId',
        { provided: itemId, minimum: 1 }
      );
    }

    // Additional domain-specific validation can be added here
    if (itemId > Number.MAX_SAFE_INTEGER) {
      throw new AdminValidationError(
        'Item ID exceeds maximum allowed value',
        'itemId',
        { provided: itemId, maximum: Number.MAX_SAFE_INTEGER }
      );
    }
  }

  /**
   * Validate user ID according to domain rules
   * 
   * @param userId User ID to validate
   * @throws {AdminValidationError} When validation fails
   */
  private validateUserId(userId: number): void {
    if (userId === null || userId === undefined) {
      throw new AdminValidationError(
        'User ID is required',
        'userId',
        { provided: userId }
      );
    }

    if (!Number.isInteger(userId)) {
      throw new AdminValidationError(
        'User ID must be an integer',
        'userId',
        { provided: userId, type: typeof userId }
      );
    }

    if (userId <= 0) {
      throw new AdminValidationError(
        'User ID must be a positive integer',
        'userId',
        { provided: userId, minimum: 1 }
      );
    }

    // Additional domain-specific validation can be added here
    if (userId > Number.MAX_SAFE_INTEGER) {
      throw new AdminValidationError(
        'User ID exceeds maximum allowed value',
        'userId',
        { provided: userId, maximum: Number.MAX_SAFE_INTEGER }
      );
    }
  }

  /**
   * Validate business rules for user banning
   * 
   * This method can be extended with additional business rules
   * without modifying existing functionality (OCP).
   * 
   * @param userId User ID to validate
   * @throws {AdminBusinessRuleError} When business rules are violated
   */
  private validateBanBusinessRules(userId: number): void {
    // Example business rule: Cannot ban user ID 1 (system admin)
    if (userId === 1) {
      throw new AdminBusinessRuleError(
        'Cannot ban system administrator account',
        { userId, reason: 'System protection rule' }
      );
    }

    // Additional business rules can be added here:
    // - Check if user is already banned
    // - Validate ban reason requirements
    // - Check admin hierarchy rules
    // - Verify cooling-off periods
  }

  /**
   * Handle repository errors and transform to domain errors
   * 
   * Provides consistent error transformation from infrastructure
   * layer to domain layer, maintaining clean architecture boundaries.
   * 
   * @param error Original error from repository
   * @param operation Description of the operation that failed
   * @throws {AdminDomainError} Transformed domain error
   */
  private handleRepositoryError(error: unknown, operation: string): never {
    if (error instanceof Error) {
      // Check for specific error patterns from repository
      const message = error.message.toLowerCase();

      // Authorization errors
      if (message.includes('authentication required') || 
          message.includes('admin privileges required')) {
        throw new AdminAuthorizationError(
          `Insufficient permissions to ${operation}`,
          error
        );
      }

      // Resource not found errors
      if (message.includes('not found')) {
        throw new AdminBusinessRuleError(
          `Cannot ${operation}: resource does not exist`,
          error
        );
      }

      // Conflict errors (e.g., user already banned)
      if (message.includes('conflict')) {
        throw new AdminBusinessRuleError(
          `Cannot ${operation}: operation conflicts with current state`,
          error
        );
      }

      // Generic infrastructure error
      throw new AdminInfrastructureError(
        `Failed to ${operation}: ${error.message}`,
        error
      );
    }

    // Unknown error type
    throw new AdminInfrastructureError(
      `Failed to ${operation}: Unknown error occurred`,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Factory function for creating AdminService instances
 * 
 * Follows dependency injection pattern for easy testing and configuration.
 * Allows different IAdminRepository implementations to be injected.
 * 
 * @param adminRepository Repository implementation
 * @returns Configured AdminService instance
 * 
 * @example
 * ```typescript
 * // Production usage
 * const adminRepo = container.getAdminRepository();
 * const adminService = createAdminService(adminRepo);
 * 
 * // Testing usage
 * const mockRepo = new MockAdminRepository();
 * const adminService = createAdminService(mockRepo);
 * ```
 */
export function createAdminService(adminRepository: IAdminRepository): AdminService {
  return new AdminService(adminRepository);
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - AdminService only handles admin business logic and validation
 * - Error classes have single responsibilities for specific error types
 * - Clear separation between validation, business rules, and data access
 * - No infrastructure concerns mixed with business logic
 * 
 * Open/Closed Principle (OCP):
 * - Open for extension: New admin operations can be added easily
 * - New validation rules can be added without modifying existing methods
 * - Error handling can be extended with new error types
 * - Business rules in validateBanBusinessRules can be extended
 * - Closed for modification: Existing functionality remains stable
 * 
 * Liskov Substitution Principle (LSP):
 * - AdminService can be substituted with any implementation
 * - Error classes maintain consistent behavior contracts
 * - AdminRepository dependency can be substituted with any implementation
 * 
 * Interface Segregation Principle (ISP):
 * - Depends only on AdminRepository methods actually used
 * - Error classes provide specific interfaces for different error types
 * - No unnecessary dependencies on unused functionality
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on AdminRepository abstraction, not concrete implementation
 * - High-level business logic doesn't depend on low-level data access
 * - Easy to test with mock repositories
 * - Framework-independent design
 * 
 * Clean Architecture Benefits:
 * 
 * 1. Domain Layer Purity:
 *    - Pure business logic with no framework dependencies
 *    - Typed domain errors for better error handling
 *    - Clear business rule enforcement
 *    - No leakage of infrastructure concerns
 * 
 * 2. Testability:
 *    - Easy to unit test with mock repositories
 *    - Predictable error scenarios
 *    - Clear validation behavior
 *    - No external dependencies
 * 
 * 3. Maintainability:
 *    - Centralized business rule validation
 *    - Consistent error handling patterns
 *    - Clear separation of concerns
 *    - Extensible design
 * 
 * 4. Type Safety:
 *    - Strongly-typed domain errors
 *    - Clear method contracts
 *    - Compile-time error detection
 *    - IntelliSense support
 * 
 * Usage Examples:
 * 
 * // In Redux thunks
 * const deleteItemThunk = createAsyncThunk(
 *   'admin/deleteItem',
 *   async (itemId: number, { rejectWithValue, extra: { container } }) => {
 *     try {
 *       const adminService = container.getAdminService();
 *       await adminService.deleteItem(itemId);
 *     } catch (error) {
 *       if (error instanceof AdminValidationError) {
 *         return rejectWithValue({ type: 'validation', message: error.message });
 *       }
 *       return rejectWithValue({ type: 'unknown', message: error.message });
 *     }
 *   }
 * );
 * 
 * // In React components with error handling
 * const AdminPanel = () => {
 *   const handleDeleteItem = async (itemId: number) => {
 *     try {
 *       await adminService.deleteItem(itemId);
 *       showSuccessMessage('Item deleted successfully');
 *     } catch (error) {
 *       if (error instanceof AdminValidationError) {
 *         showValidationError(error.message, error.field);
 *       } else if (error instanceof AdminAuthorizationError) {
 *         showAuthError('You do not have permission for this action');
 *       } else {
 *         showGenericError('An unexpected error occurred');
 *       }
 *     }
 *   };
 * };
 * 
 * // Testing example
 * describe('AdminService', () => {
 *   let mockRepository: jest.Mocked<AdminRepository>;
 *   let adminService: AdminService;
 * 
 *   beforeEach(() => {
 *     mockRepository = {
 *       deleteItem: jest.fn(),
 *       banUser: jest.fn()
 *     };
 *     adminService = new AdminService(mockRepository);
 *   });
 * 
 *   test('deleteItem validates positive ID', async () => {
 *     await expect(adminService.deleteItem(-1))
 *       .rejects.toThrow(AdminValidationError);
 *   });
 * 
 *   test('banUser prevents system admin ban', async () => {
 *     await expect(adminService.banUser(1))
 *       .rejects.toThrow(AdminBusinessRuleError);
 *   });
 * 
 *   test('deleteItem delegates to repository', async () => {
 *     await adminService.deleteItem(123);
 *     expect(mockRepository.deleteItem).toHaveBeenCalledWith(123);
 *   });
 * });
 */