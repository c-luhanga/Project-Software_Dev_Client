import { createAdminService, AdminValidationError, AdminBusinessRuleError } from './adminService';
import type { IAdminRepository } from './contracts';

/**
 * Example demonstrating AdminService usage with validation and typed errors
 * 
 * Shows how the service wrapper follows OCP and DIP principles while
 * providing comprehensive business logic validation.
 */

/**
 * Example admin operations handler
 */
export class AdminOperationsHandler {
  private adminService;

  constructor(adminRepository: IAdminRepository) {
    // Factory pattern with DIP - depends on abstraction
    this.adminService = createAdminService(adminRepository);
  }

  /**
   * Handle item deletion with proper error handling
   */
  async handleDeleteItem(itemId: unknown): Promise<{ success: boolean; message: string }> {
    try {
      // Service will validate that itemId is a positive integer
      await this.adminService.deleteItem(itemId as number);
      
      return {
        success: true,
        message: `Item ${itemId} deleted successfully`
      };
    } catch (error) {
      // Typed error handling
      if (error instanceof AdminValidationError) {
        return {
          success: false,
          message: `Validation error: ${error.message} (Field: ${error.field})`
        };
      }
      
      if (error instanceof AdminBusinessRuleError) {
        return {
          success: false,
          message: `Business rule violation: ${error.message}`
        };
      }
      
      return {
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }

  /**
   * Handle user ban with business rule enforcement
   */
  async handleBanUser(userId: unknown): Promise<{ success: boolean; message: string }> {
    try {
      // Service will validate userId and enforce business rules
      await this.adminService.banUser(userId as number);
      
      return {
        success: true,
        message: `User ${userId} banned successfully`
      };
    } catch (error) {
      // Typed error handling allows specific responses
      if (error instanceof AdminValidationError) {
        return {
          success: false,
          message: `Invalid user ID: ${error.message}`
        };
      }
      
      if (error instanceof AdminBusinessRuleError) {
        return {
          success: false,
          message: `Cannot ban user: ${error.message}`
        };
      }
      
      return {
        success: false,
        message: `Ban operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

/**
 * Test scenarios demonstrating validation and business rules
 */
export const AdminServiceExamples = {
  /**
   * Demonstrates validation errors for invalid IDs
   */
  validationExamples: [
    { itemId: -1, expectError: 'positive integer' },
    { itemId: 0, expectError: 'positive integer' },
    { itemId: 12.5, expectError: 'integer' },
    { itemId: null, expectError: 'required' },
    { itemId: undefined, expectError: 'required' }
  ],

  /**
   * Demonstrates business rule enforcement
   */
  businessRuleExamples: [
    { userId: 1, expectError: 'system administrator' }, // Cannot ban system admin
    { userId: 123, expectSuccess: true } // Regular user ban should work
  ],

  /**
   * Valid operations that should succeed
   */
  validExamples: [
    { itemId: 123, operation: 'delete' },
    { userId: 456, operation: 'ban' }
  ]
};

/**
 * Usage demonstration function
 */
export async function demonstrateAdminService(adminRepository: IAdminRepository) {
  const handler = new AdminOperationsHandler(adminRepository);

  console.log('=== Admin Service Validation Examples ===');

  // Test validation errors
  for (const example of AdminServiceExamples.validationExamples) {
    const result = await handler.handleDeleteItem(example.itemId);
    console.log(`Delete item ${example.itemId}:`, result);
  }

  // Test business rule enforcement
  for (const example of AdminServiceExamples.businessRuleExamples) {
    const result = await handler.handleBanUser(example.userId);
    console.log(`Ban user ${example.userId}:`, result);
  }

  // Test valid operations (would succeed with real repository)
  console.log('\n=== Valid Operations (would succeed with real data) ===');
  for (const example of AdminServiceExamples.validExamples) {
    if (example.operation === 'delete') {
      console.log(`Would delete item ${example.itemId}`);
    } else if (example.operation === 'ban') {
      console.log(`Would ban user ${example.userId}`);
    }
  }
}

/*
 * Key Benefits Demonstrated:
 * 
 * 1. Open/Closed Principle (OCP):
 *    - AdminService is open for extension (new validation rules)
 *    - Closed for modification (existing validation remains stable)
 *    - New business rules can be added without changing existing code
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - AdminService depends on IAdminRepository abstraction
 *    - Easy to substitute different repository implementations
 *    - Business logic is independent of data access details
 * 
 * 3. Typed Error Handling:
 *    - Different error types for different failure scenarios
 *    - Compile-time safety with TypeScript
 *    - Clear error categorization for appropriate responses
 * 
 * 4. Input Validation:
 *    - Business rules enforced consistently
 *    - Positive integer validation for IDs
 *    - Comprehensive edge case handling
 * 
 * 5. Business Rule Enforcement:
 *    - Cannot ban system administrator (user ID 1)
 *    - Extensible rule system for future requirements
 *    - Clear separation between validation and business logic
 */