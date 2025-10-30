/**
 * Complete Clean Architecture Integration Example
 * 
 * Demonstrates how UserService fits into the full architecture stack:
 * Domain → Infrastructure → Application → Presentation
 */

import type { IUserService, IUserRepository } from './contracts';
import { UserService } from './userService';
import { UserRepository } from '../../infrastructure/user/userRepository';
import { apiClient } from '../../infrastructure/http/axiosClient';

/**
 * Application Layer Service
 * Orchestrates domain services for use by presentation layer
 */
export class UserApplicationService {
  private readonly userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  /**
   * Get user profile for display
   * Application layer adds cross-cutting concerns
   */
  async getUserProfile() {
    try {
      const profile = await this.userService.getProfile();
      
      // Application-level concerns (could be added):
      // - Caching
      // - Metrics/Analytics
      // - Permission checks
      // - Audit logging
      
      return profile;
    } catch (error) {
      // Application-level error handling
      console.error('Application: Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * Validates and applies business rules before persistence
   */
  async updateUserProfile(updates: { phone?: string; house?: string; profileImageUrl?: string }) {
    try {
      await this.userService.updateProfile(updates);
      
      // Application-level post-processing (could be added):
      // - Clear caches
      // - Send notifications
      // - Update search indexes
      // - Trigger analytics events
      
    } catch (error) {
      console.error('Application: Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Get user's items
   */
  async getUserItems() {
    try {
      return await this.userService.getMyItems();
    } catch (error) {
      console.error('Application: Failed to get user items:', error);
      throw error;
    }
  }
}

/**
 * Dependency Injection Container
 * Wires up the complete dependency chain following DIP
 */
export class UserServiceContainer {
  private static instance: UserServiceContainer;
  private userApplicationService: UserApplicationService;

  private constructor() {
    // Build dependency chain from bottom up
    // Infrastructure Layer
    const userRepository: IUserRepository = new UserRepository(apiClient);
    
    // Domain Layer
    const userService: IUserService = new UserService(userRepository);
    
    // Application Layer
    this.userApplicationService = new UserApplicationService(userService);
  }

  static getInstance(): UserServiceContainer {
    if (!UserServiceContainer.instance) {
      UserServiceContainer.instance = new UserServiceContainer();
    }
    return UserServiceContainer.instance;
  }

  getUserApplicationService(): UserApplicationService {
    return this.userApplicationService;
  }
}

/**
 * Factory function for easy consumption by presentation layer
 */
export function createUserApplicationService(): UserApplicationService {
  return UserServiceContainer.getInstance().getUserApplicationService();
}

/*
 * Usage in React Components (Presentation Layer):
 * 
 * // Hook for user profile management
 * function useUserProfile() {
 *   const userAppService = createUserApplicationService();
 *   
 *   const loadProfile = async () => {
 *     return await userAppService.getUserProfile();
 *   };
 *   
 *   const updateProfile = async (updates) => {
 *     await userAppService.updateUserProfile(updates);
 *   };
 *   
 *   return { loadProfile, updateProfile };
 * }
 * 
 * // Component usage
 * function ProfilePage() {
 *   const { loadProfile, updateProfile } = useUserProfile();
 *   // Component logic...
 * }
 */

/*
 * Testing Benefits:
 * 
 * // Domain Service Testing (Pure Business Logic)
 * const mockRepository: IUserRepository = {
 *   getMe: jest.fn(),
 *   updateMe: jest.fn(),
 *   getMyItems: jest.fn()
 * };
 * const userService = new UserService(mockRepository);
 * 
 * // Application Service Testing
 * const mockDomainService: IUserService = {
 *   getProfile: jest.fn(),
 *   updateProfile: jest.fn(),
 *   getMyItems: jest.fn()
 * };
 * const appService = new UserApplicationService(mockDomainService);
 * 
 * // Infrastructure Testing
 * const mockApiClient: IApiClient = {
 *   get: jest.fn(),
 *   post: jest.fn(),
 *   put: jest.fn(),
 *   delete: jest.fn(),
 *   setToken: jest.fn()
 * };
 * const repository = new UserRepository(mockApiClient);
 */

/*
 * Clean Architecture Benefits Achieved:
 * 
 * 1. Dependency Rule Compliance:
 *    - Domain layer knows nothing about infrastructure
 *    - UserService depends only on IUserRepository abstraction
 *    - Infrastructure depends on domain contracts
 * 
 * 2. Testability:
 *    - Each layer can be tested in isolation
 *    - Dependencies can be easily mocked
 *    - Business logic is pure and framework-independent
 * 
 * 3. Flexibility:
 *    - Can swap infrastructure implementations
 *    - Can add new validation rules without changing service
 *    - Can modify UI without affecting business logic
 * 
 * 4. Maintainability:
 *    - Clear separation of concerns
 *    - Single responsibility per class
 *    - Open for extension, closed for modification
 */