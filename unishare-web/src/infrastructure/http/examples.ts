/**
 * Example Usage of HTTP Client Abstraction
 * 
 * Demonstrates Dependency Inversion Principle in action:
 * - Repositories depend on IApiClient (abstraction)
 * - Can easily swap implementations (Axios, Fetch, Mock)
 * - Type-safe HTTP operations with error handling
 */

import type { IApiClient } from './IApiClient';
import type { UserProfile, UpdateProfileCommand } from '../../domain/user/contracts';
import { AuthenticationError, ApiError } from './IApiClient';

/**
 * Example repository using HTTP client abstraction
 * Follows DIP by depending on IApiClient interface, not concrete implementation
 */
export class UserRepository {
  private readonly apiClient: IApiClient;

  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  async getProfile(): Promise<UserProfile> {
    try {
      return await this.apiClient.get<UserProfile>('/users/me');
    } catch (error) {
      if (error instanceof AuthenticationError) {
        // Handle auth errors specifically
        throw new Error('Please log in to view your profile');
      }
      if (error instanceof ApiError) {
        // Handle other API errors
        throw new Error(`Failed to load profile: ${error.message}`);
      }
      throw error;
    }
  }

  async updateProfile(command: UpdateProfileCommand): Promise<void> {
    try {
      await this.apiClient.put<void>('/users/me', command);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new Error('Please log in to update your profile');
      }
      if (error instanceof ApiError) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * Example service using repository with injected HTTP client
 */
export class UserService {
  private userRepository: UserRepository;

  constructor(apiClient: IApiClient) {
    this.userRepository = new UserRepository(apiClient);
  }

  async loadUserProfile(): Promise<UserProfile> {
    return await this.userRepository.getProfile();
  }

  async saveUserProfile(updates: UpdateProfileCommand): Promise<void> {
    return await this.userRepository.updateProfile(updates);
  }
}

/*
 * Usage Example:
 * 
 * // Production - use Axios implementation
 * import { apiClient } from './axiosClient';
 * const userService = new UserService(apiClient);
 * 
 * // Testing - use mock implementation
 * const mockClient: IApiClient = {
 *   get: jest.fn(),
 *   post: jest.fn(), 
 *   put: jest.fn(),
 *   delete: jest.fn(),
 *   setToken: jest.fn()
 * };
 * const userService = new UserService(mockClient);
 * 
 * // Alternative implementation - Fetch API
 * class FetchApiClient implements IApiClient {
 *   // Implementation using fetch instead of axios
 * }
 * const userService = new UserService(new FetchApiClient());
 */

/*
 * Benefits of this HTTP abstraction:
 * 
 * 1. Dependency Inversion Principle:
 *    - High-level modules (repositories) don't depend on low-level modules (axios)
 *    - Both depend on abstractions (IApiClient interface)
 *    - Easy to swap implementations without changing business logic
 * 
 * 2. Single Responsibility Principle:
 *    - AxiosApiClient focuses solely on HTTP communication via Axios
 *    - Clean separation of concerns between transport and business logic
 * 
 * 3. Testability:
 *    - Easy to mock IApiClient for unit testing
 *    - No need to mock axios directly in business logic tests
 * 
 * 4. Flexibility:
 *    - Can switch from Axios to Fetch API without changing repositories
 *    - Can add features like caching, retry logic to implementation
 *    - Different implementations for different environments
 */