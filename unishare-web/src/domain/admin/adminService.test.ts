import { 
  AdminService, 
  AdminValidationError, 
  AdminAuthorizationError, 
  AdminBusinessRuleError,
  AdminInfrastructureError,
  createAdminService 
} from './adminService';
import type { IAdminRepository } from './contracts';

/**
 * Test utilities and examples for AdminService
 * 
 * Demonstrates how the service follows OCP and DIP principles
 * while providing comprehensive validation and error handling.
 */

/**
 * Mock AdminRepository for testing
 */
export class MockAdminRepository implements IAdminRepository {
  public deleteItemCalls: number[] = [];
  public banUserCalls: number[] = [];
  
  private shouldThrowError = false;
  private errorToThrow: any = null;

  async deleteItem(itemId: number): Promise<void> {
    this.deleteItemCalls.push(itemId);
    
    if (this.shouldThrowError) {
      throw this.errorToThrow;
    }
  }

  async banUser(userId: number): Promise<void> {
    this.banUserCalls.push(userId);
    
    if (this.shouldThrowError) {
      throw this.errorToThrow;
    }
  }

  // Test helper methods
  mockError(error: any): void {
    this.shouldThrowError = true;
    this.errorToThrow = error;
  }

  clearError(): void {
    this.shouldThrowError = false;
    this.errorToThrow = null;
  }

  reset(): void {
    this.deleteItemCalls = [];
    this.banUserCalls = [];
    this.clearError();
  }
}

/**
 * Test scenarios demonstrating AdminService behavior
 */
export class AdminServiceTestScenarios {
  private mockRepository: MockAdminRepository;
  private adminService: AdminService;

  constructor() {
    this.mockRepository = new MockAdminRepository();
    this.adminService = new AdminService(this.mockRepository);
  }

  /**
   * Test successful item deletion
   */
  async testDeleteItemSuccess(): Promise<boolean> {
    try {
      await this.adminService.deleteItem(123);
      
      // Verify repository was called correctly
      return this.mockRepository.deleteItemCalls.includes(123);
    } catch (error) {
      return false;
    }
  }

  /**
   * Test validation error for negative item ID
   */
  async testDeleteItemValidationError(): Promise<boolean> {
    try {
      await this.adminService.deleteItem(-1);
      return false; // Should have thrown an error
    } catch (error) {
      return error instanceof AdminValidationError && 
             error.field === 'itemId' &&
             error.code === 'ADMIN_VALIDATION_ERROR';
    }
  }

  /**
   * Test validation error for zero item ID
   */
  async testDeleteItemZeroValidation(): Promise<boolean> {
    try {
      await this.adminService.deleteItem(0);
      return false; // Should have thrown an error
    } catch (error) {
      return error instanceof AdminValidationError && 
             error.message.includes('positive integer');
    }
  }

  /**
   * Test validation error for non-integer item ID
   */
  async testDeleteItemNonIntegerValidation(): Promise<boolean> {
    try {
      await this.adminService.deleteItem(12.5);
      return false; // Should have thrown an error
    } catch (error) {
      return error instanceof AdminValidationError && 
             error.message.includes('must be an integer');
    }
  }

  /**
   * Test successful user ban
   */
  async testBanUserSuccess(): Promise<boolean> {
    try {
      await this.adminService.banUser(456);
      
      // Verify repository was called correctly
      return this.mockRepository.banUserCalls.includes(456);
    } catch (error) {
      return false;
    }
  }

  /**
   * Test business rule preventing system admin ban
   */
  async testBanUserSystemAdminError(): Promise<boolean> {
    try {
      await this.adminService.banUser(1);
      return false; // Should have thrown an error
    } catch (error) {
      return error instanceof AdminBusinessRuleError && 
             error.message.includes('system administrator') &&
             error.code === 'ADMIN_BUSINESS_RULE_ERROR';
    }
  }

  /**
   * Test validation error for invalid user ID
   */
  async testBanUserValidationError(): Promise<boolean> {
    try {
      await this.adminService.banUser(-5);
      return false; // Should have thrown an error
    } catch (error) {
      return error instanceof AdminValidationError && 
             error.field === 'userId';
    }
  }

  /**
   * Test infrastructure error handling
   */
  async testInfrastructureErrorHandling(): Promise<boolean> {
    // Mock repository to throw infrastructure error
    this.mockRepository.mockError(new Error('Network connection failed'));
    
    try {
      await this.adminService.deleteItem(123);
      return false; // Should have thrown an error
    } catch (error) {
      return error instanceof AdminInfrastructureError && 
             error.category === 'infrastructure' &&
             error.originalError?.message === 'Network connection failed';
    }
  }

  /**
   * Test authorization error transformation
   */
  async testAuthorizationErrorTransformation(): Promise<boolean> {
    // Mock repository to throw authorization error
    this.mockRepository.mockError(new Error('Admin privileges required'));
    
    try {
      await this.adminService.banUser(123);
      return false; // Should have thrown an error
    } catch (error) {
      return error instanceof AdminAuthorizationError && 
             error.category === 'authorization' &&
             error.message.includes('Insufficient permissions');
    }
  }

  /**
   * Test business rule error for resource not found
   */
  async testResourceNotFoundError(): Promise<boolean> {
    // Mock repository to throw not found error
    this.mockRepository.mockError(new Error('User not found'));
    
    try {
      await this.adminService.banUser(999);
      return false; // Should have thrown an error
    } catch (error) {
      return error instanceof AdminBusinessRuleError && 
             error.message.includes('does not exist');
    }
  }

  /**
   * Run all test scenarios
   */
  async runAllTests(): Promise<{ passed: number; total: number; results: Record<string, boolean> }> {
    const tests = {
      deleteItemSuccess: () => this.testDeleteItemSuccess(),
      deleteItemValidationError: () => this.testDeleteItemValidationError(),
      deleteItemZeroValidation: () => this.testDeleteItemZeroValidation(),
      deleteItemNonIntegerValidation: () => this.testDeleteItemNonIntegerValidation(),
      banUserSuccess: () => this.testBanUserSuccess(),
      banUserSystemAdminError: () => this.testBanUserSystemAdminError(),
      banUserValidationError: () => this.testBanUserValidationError(),
      infrastructureErrorHandling: () => this.testInfrastructureErrorHandling(),
      authorizationErrorTransformation: () => this.testAuthorizationErrorTransformation(),
      resourceNotFoundError: () => this.testResourceNotFoundError()
    };

    const results: Record<string, boolean> = {};
    let passed = 0;

    for (const [testName, testFn] of Object.entries(tests)) {
      this.mockRepository.reset();
      try {
        results[testName] = await testFn();
        if (results[testName]) passed++;
      } catch (error) {
        results[testName] = false;
        console.error(`Test ${testName} failed:`, error);
      }
    }

    return { passed, total: Object.keys(tests).length, results };
  }
}

/**
 * Example domain service composition (OCP extension)
 */
export class ExtendedAdminService extends AdminService {
  /**
   * Enhanced delete item with audit logging
   */
  async deleteItemWithAudit(itemId: number, adminUserId: number, reason: string): Promise<void> {
    // Additional validation
    if (!reason || reason.trim().length === 0) {
      throw new AdminValidationError(
        'Deletion reason is required for audit trail',
        'reason'
      );
    }

    // Log the action (in real implementation, this would use a logger service)
    console.log(`Admin ${adminUserId} deleting item ${itemId}: ${reason}`);

    // Delegate to base class
    await this.deleteItem(itemId);

    // Log success
    console.log(`Item ${itemId} deleted successfully by admin ${adminUserId}`);
  }

  /**
   * Bulk ban operation with validation
   */
  async bulkBanUsers(userIds: number[], _reason: string): Promise<{ success: number[]; failed: Array<{ userId: number; error: string }> }> {
    if (!userIds || userIds.length === 0) {
      throw new AdminValidationError('User IDs array cannot be empty', 'userIds');
    }

    if (userIds.length > 100) {
      throw new AdminValidationError('Cannot ban more than 100 users at once', 'userIds');
    }

    const results = {
      success: [] as number[],
      failed: [] as Array<{ userId: number; error: string }>
    };

    for (const userId of userIds) {
      try {
        await this.banUser(userId);
        results.success.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
}

/**
 * Usage examples demonstrating different patterns
 */
export const AdminServiceExamples = {
  /**
   * Basic usage pattern
   */
  basicUsage: async (adminService: AdminService) => {
    try {
      await adminService.deleteItem(123);
      console.log('Item deleted successfully');
    } catch (error) {
      if (error instanceof AdminValidationError) {
        console.error('Validation error:', error.message, 'Field:', error.field);
      } else if (error instanceof AdminAuthorizationError) {
        console.error('Authorization error:', error.message);
      } else if (error instanceof AdminBusinessRuleError) {
        console.error('Business rule violation:', error.message);
      } else if (error instanceof AdminInfrastructureError) {
        console.error('Infrastructure error:', error.message);
      }
    }
  },

  /**
   * Error handling pattern for UI
   */
  uiErrorHandling: (error: unknown) => {
    if (error instanceof AdminValidationError) {
      return {
        type: 'validation' as const,
        message: error.message,
        field: error.field,
        userMessage: 'Please check your input and try again.'
      };
    }
    
    if (error instanceof AdminAuthorizationError) {
      return {
        type: 'authorization' as const,
        message: error.message,
        userMessage: 'You do not have permission to perform this action.'
      };
    }
    
    if (error instanceof AdminBusinessRuleError) {
      return {
        type: 'business' as const,
        message: error.message,
        userMessage: 'This action violates business rules.'
      };
    }
    
    return {
      type: 'unknown' as const,
      message: error instanceof Error ? error.message : 'Unknown error',
      userMessage: 'An unexpected error occurred. Please try again.'
    };
  },

  /**
   * Factory pattern for dependency injection
   */
  factoryUsage: (adminRepository: IAdminRepository) => {
    const adminService = createAdminService(adminRepository);
    return adminService;
  }
};

/*
 * SOLID Principles Demonstrated:
 * 
 * Single Responsibility Principle (SRP):
 * - AdminService: Only handles business logic and validation
 * - MockAdminRepository: Only handles test scenarios
 * - Error classes: Each has specific error type responsibility
 * - Test scenarios: Each test has single verification responsibility
 * 
 * Open/Closed Principle (OCP):
 * - ExtendedAdminService: Shows how to extend without modifying base class
 * - New validation rules can be added without changing existing code
 * - Error handling can be extended with new error types
 * - Test scenarios can be added without modifying existing tests
 * 
 * Liskov Substitution Principle (LSP):
 * - ExtendedAdminService can substitute AdminService
 * - MockAdminRepository can substitute real AdminRepository
 * - All error types follow consistent contracts
 * 
 * Interface Segregation Principle (ISP):
 * - AdminService only depends on AdminRepository methods it uses
 * - Error classes expose only relevant properties
 * - Test interfaces are minimal and focused
 * 
 * Dependency Inversion Principle (DIP):
 * - AdminService depends on AdminRepository abstraction
 * - Easy to substitute different repository implementations
 * - High-level business logic independent of infrastructure details
 */