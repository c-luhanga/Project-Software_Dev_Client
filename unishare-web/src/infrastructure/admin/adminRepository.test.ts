import type { IApiClient } from '../http/IApiClient';
import { AdminRepository, createAdminRepository } from './adminRepository';

/**
 * Example usage and testing scenarios for AdminRepository
 * 
 * Demonstrates how the repository follows SRP and DIP principles
 * while providing clean, testable interfaces for admin operations.
 */

/**
 * Production usage example
 */
export function createProductionAdminRepository(): AdminRepository {
  // In a real application, this would come from the DI container
  const apiClient: IApiClient = {
    get: async () => { throw new Error('Not implemented'); },
    post: async () => { throw new Error('Not implemented'); },
    put: async () => { throw new Error('Not implemented'); },
    delete: async () => { throw new Error('Not implemented'); },
    setToken: () => { /* implementation */ },
    getToken: () => null
  };

  return createAdminRepository(apiClient);
}

/**
 * Mock API client for testing
 */
export class MockApiClient implements IApiClient {
  public deleteCalls: Array<{ url: string }> = [];
  public postCalls: Array<{ url: string; body?: unknown }> = [];
  
  private shouldThrowError = false;
  private errorToThrow: any = null;

  async get<T>(): Promise<T> {
    throw new Error('Not implemented in mock');
  }

  async post<T>(url: string, body?: unknown): Promise<T> {
    this.postCalls.push({ url, body });
    
    if (this.shouldThrowError) {
      throw this.errorToThrow;
    }
    
    return {} as T;
  }

  async put<T>(): Promise<T> {
    throw new Error('Not implemented in mock');
  }

  async delete<T>(url: string): Promise<T> {
    this.deleteCalls.push({ url });
    
    if (this.shouldThrowError) {
      throw this.errorToThrow;
    }
    
    return {} as T;
  }

  setToken(): void {
    // Mock implementation
  }

  getToken(): string | null {
    return null;
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
    this.deleteCalls = [];
    this.postCalls = [];
    this.clearError();
  }
}

/**
 * Test scenarios demonstrating repository behavior
 */
export class AdminRepositoryTestScenarios {
  private mockClient: MockApiClient;
  private repository: AdminRepository;

  constructor() {
    this.mockClient = new MockApiClient();
    this.repository = new AdminRepository(this.mockClient);
  }

  /**
   * Test successful item deletion
   */
  async testDeleteItemSuccess(): Promise<boolean> {
    try {
      await this.repository.deleteItem(123);
      
      // Verify correct API call was made
      const deleteCalls = this.mockClient.deleteCalls;
      return deleteCalls.length === 1 && deleteCalls[0].url === '/admin/items/123';
    } catch (error) {
      return false;
    }
  }

  /**
   * Test successful user ban
   */
  async testBanUserSuccess(): Promise<boolean> {
    try {
      await this.repository.banUser(456);
      
      // Verify correct API call was made
      const postCalls = this.mockClient.postCalls;
      return postCalls.length === 1 && postCalls[0].url === '/admin/users/456/ban';
    } catch (error) {
      return false;
    }
  }

  /**
   * Test error handling for forbidden operations
   */
  async testForbiddenError(): Promise<boolean> {
    this.mockClient.mockError({ status: 403, message: 'Forbidden' });
    
    try {
      await this.repository.deleteItem(123);
      return false; // Should have thrown an error
    } catch (error: any) {
      return error.message === 'Admin privileges required for this operation';
    }
  }

  /**
   * Test validation for invalid input
   */
  async testInvalidInput(): Promise<boolean> {
    try {
      await this.repository.deleteItem(0);
      return false; // Should have thrown an error
    } catch (error: any) {
      return error.message === 'Invalid item ID provided';
    }
  }

  /**
   * Run all test scenarios
   */
  async runAllTests(): Promise<{ passed: number; total: number; results: Record<string, boolean> }> {
    const tests = {
      deleteItemSuccess: () => this.testDeleteItemSuccess(),
      banUserSuccess: () => this.testBanUserSuccess(),
      forbiddenError: () => this.testForbiddenError(),
      invalidInput: () => this.testInvalidInput()
    };

    const results: Record<string, boolean> = {};
    let passed = 0;

    for (const [testName, testFn] of Object.entries(tests)) {
      this.mockClient.reset();
      try {
        results[testName] = await testFn();
        if (results[testName]) passed++;
      } catch (error) {
        results[testName] = false;
      }
    }

    return { passed, total: Object.keys(tests).length, results };
  }
}

/**
 * Example integration with domain service
 */
export class AdminService {
  private readonly adminRepository: AdminRepository;

  constructor(adminRepository: AdminRepository) {
    this.adminRepository = adminRepository;
  }

  /**
   * Delete item with business logic validation
   */
  async deleteItemWithValidation(itemId: number, adminUserId: number): Promise<void> {
    // Business logic would go here
    if (!adminUserId || adminUserId <= 0) {
      throw new Error('Valid admin user ID required');
    }

    // Delegate to repository for data access
    await this.adminRepository.deleteItem(itemId);
  }

  /**
   * Ban user with logging
   */
  async banUserWithLogging(userId: number, reason: string): Promise<void> {
    console.log(`Admin banning user ${userId} for reason: ${reason}`);
    
    // Delegate to repository
    await this.adminRepository.banUser(userId);
    
    console.log(`User ${userId} has been banned successfully`);
  }
}

/*
 * Architecture Benefits Demonstrated:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - AdminRepository: Only handles API communication
 *    - AdminService: Only handles business logic
 *    - MockApiClient: Only handles testing scenarios
 *    - Clear separation of concerns
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - AdminRepository depends on IApiClient abstraction
 *    - Easy to swap implementations (production vs. mock)
 *    - High-level modules don't depend on low-level details
 * 
 * 3. Testability:
 *    - MockApiClient allows comprehensive testing
 *    - No external dependencies in tests
 *    - Predictable behavior verification
 * 
 * 4. Framework Independence:
 *    - No React, Redux, or UI framework dependencies
 *    - Can be used in any JavaScript environment
 *    - Pure business logic separation
 * 
 * 5. Type Safety:
 *    - Full TypeScript support throughout
 *    - Compile-time error detection
 *    - Clear interface contracts
 */