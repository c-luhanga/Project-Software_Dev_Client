/**
 * Dependency Injection Container Usage Examples
 * 
 * Demonstrates how to use the DI container to get properly wired services
 * following Dependency Inversion Principle
 */

import { 
  getUserService, 
  getUserRepository, 
  getAuthService 
} from './container';

/**
 * Example: Using UserService through DI container
 * Service comes fully wired with all its dependencies
 */
export async function exampleUserProfileOperation() {
  // Get fully configured service from container
  const userService = getUserService();
  
  try {
    // Business operation - all dependencies are injected
    const profile = await userService.getProfile();
    console.log('User profile loaded:', profile);
    
    // Update operation with validation
    await userService.updateProfile({
      phone: '+1-555-0123',
      house: 'Miller House'
    });
    console.log('Profile updated successfully');
    
  } catch (error) {
    console.error('User operation failed:', error);
  }
}

/**
 * Example: Using repository directly for data access
 * Repository comes with HTTP client injected
 */
export async function exampleDirectRepositoryAccess() {
  const userRepository = getUserRepository();
  
  try {
    const items = await userRepository.getMyItems();
    console.log('User items:', items);
  } catch (error) {
    console.error('Failed to load items:', error);
  }
}

/**
 * Example: Token management through the container
 */
export function exampleTokenManagement() {
  const authService = getAuthService();
  
  // Login sets token automatically across all services
  authService.login({ email: 'user@principia.edu', password: 'password' })
    .then(() => {
      console.log('Logged in successfully');
      
      // All subsequent API calls will include the token
      const userService = getUserService();
      return userService.getProfile();
    })
    .then(profile => {
      console.log('Profile loaded with authentication:', profile);
    })
    .catch(error => {
      console.error('Authentication flow failed:', error);
    });
}

/*
 * Container Architecture Benefits:
 * 
 * 1. Dependency Inversion Principle (DIP):
 *    - High-level services depend on abstractions
 *    - Container wires concrete implementations
 *    - Easy to swap implementations for testing
 * 
 * 2. Single Responsibility:
 *    - Container only responsible for object creation and wiring
 *    - Services focus on business logic
 *    - Clean separation of concerns
 * 
 * 3. Singleton Management:
 *    - API client is shared across all services
 *    - Token state is consistent throughout application
 *    - Efficient resource usage
 * 
 * 4. Type Safety:
 *    - All getters return proper interfaces
 *    - Compile-time validation of dependencies
 *    - IntelliSense support for service methods
 * 
 * 5. Testability:
 *    - Easy to create test containers with mocks
 *    - Services can be tested in isolation
 *    - No framework coupling in business logic
 */

/*
 * Testing Example:
 * 
 * // Create test container with mocks
 * const testContainer = {
 *   apiClient: mockApiClient,
 *   userRepository: new UserRepository(mockApiClient),
 *   userService: new UserService(mockUserRepository)
 * };
 * 
 * // Override container for tests
 * jest.mock('./container', () => ({
 *   getUserService: () => testContainer.userService
 * }));
 */