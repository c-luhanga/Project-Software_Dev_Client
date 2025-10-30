/**
 * Example Usage of UserRepository Infrastructure Implementation
 * 
 * Demonstrates Clean Architecture layering:
 * - Application layer depends on domain contracts (IUserRepository)
 * - Infrastructure layer provides concrete implementation (UserRepository)
 * - Dependency injection follows DIP principles
 */

import type { IUserRepository } from '../../domain/user/contracts';
import type { IApiClient } from '../http/IApiClient';
import { UserRepository } from './userRepository';
import { apiClient } from '../http/axiosClient';

/**
 * Example application service using dependency injection
 * Depends on domain contracts, not infrastructure implementations
 */
export class UserApplicationService {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getCurrentUserProfile() {
    try {
      return await this.userRepository.getMe();
    } catch (error) {
      // Application-level error handling
      console.error('Failed to load user profile:', error);
      throw new Error('Unable to load your profile. Please try again.');
    }
  }

  async updateUserProfile(updates: { phone?: string; house?: string; profileImageUrl?: string }) {
    try {
      await this.userRepository.updateMe(updates);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw new Error('Unable to update your profile. Please try again.');
    }
  }

  async getUserItems() {
    try {
      return await this.userRepository.getMyItems();
    } catch (error) {
      console.error('Failed to load user items:', error);
      throw new Error('Unable to load your items. Please try again.');
    }
  }
}

/**
 * Dependency injection setup
 * Shows how to wire dependencies following DIP
 */
export function createUserApplicationService(httpClient?: IApiClient): UserApplicationService {
  // Use provided HTTP client or default
  const client = httpClient || apiClient;
  
  // Create repository with injected HTTP client
  const userRepository = new UserRepository(client);
  
  // Create application service with injected repository
  return new UserApplicationService(userRepository);
}

/*
 * Usage Examples:
 * 
 * // Production usage with default HTTP client
 * const userService = createUserApplicationService();
 * const profile = await userService.getCurrentUserProfile();
 * 
 * // Testing with mock HTTP client
 * const mockHttpClient: IApiClient = {
 *   get: jest.fn().mockResolvedValue({ userId: 1, firstName: 'John', lastName: 'Doe' }),
 *   post: jest.fn(),
 *   put: jest.fn(),
 *   delete: jest.fn(),
 *   setToken: jest.fn()
 * };
 * const userService = createUserApplicationService(mockHttpClient);
 * 
 * // Testing with mock repository directly
 * const mockRepository: IUserRepository = {
 *   getMe: jest.fn().mockResolvedValue({ userId: 1, firstName: 'John' }),
 *   updateMe: jest.fn(),
 *   getMyItems: jest.fn().mockResolvedValue([])
 * };
 * const userService = new UserApplicationService(mockRepository);
 */

/*
 * Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - UserRepository: Only responsible for user data access via HTTP
 *    - UserApplicationService: Only responsible for user-related business operations
 *    - Each class has one reason to change
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - High-level modules (UserApplicationService) don't depend on low-level modules (UserRepository)
 *    - Both depend on abstractions (IUserRepository, IApiClient)
 *    - Abstractions don't depend on details
 * 
 * 3. Testability:
 *    - Easy to mock IUserRepository for testing UserApplicationService
 *    - Easy to mock IApiClient for testing UserRepository
 *    - Clear separation of concerns enables focused unit tests
 * 
 * 4. Flexibility:
 *    - Can swap HTTP implementations without changing business logic
 *    - Can add features like caching, validation at appropriate layers
 *    - Database/storage changes don't affect business logic
 */