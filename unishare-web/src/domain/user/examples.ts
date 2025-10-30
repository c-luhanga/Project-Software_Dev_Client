/**
 * Example Usage of Domain Contracts
 * 
 * This file demonstrates how the domain contracts follow DIP and ISP:
 * - Components depend on IUserService (abstraction)
 * - Services depend on IUserRepository (abstraction)
 * - Interfaces are small and focused (ISP)
 * - No implementation details leaked (DIP)
 */

import type { 
  IUserService, 
  IUserRepository, 
  UpdateProfileCommand, 
  UserProfile 
} from './contracts';

/**
 * Example React component using domain contracts
 * Depends on abstraction (IUserService), not concrete implementation
 */
export class UserProfileComponent {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  async loadProfile(): Promise<UserProfile> {
    // Component doesn't know how data is fetched
    // Depends only on the contract (DIP)
    return await this.userService.getProfile();
  }

  async updateProfile(updates: UpdateProfileCommand): Promise<void> {
    // Uses focused interface for updates only (ISP)
    return await this.userService.updateProfile(updates);
  }
}

/**
 * Example service implementation depending on repository abstraction
 * Business logic layer - no knowledge of data access implementation
 */
export class UserService implements IUserService {
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  async getProfile(): Promise<UserProfile> {
    // Service depends on repository abstraction (DIP)
    // Can add business logic, caching, validation here
    return await this.repository.getMe();
  }

  async updateProfile(command: UpdateProfileCommand): Promise<void> {
    // Business validation could go here
    if (command.profileImageUrl && !this.isValidImageUrl(command.profileImageUrl)) {
      throw new Error('Invalid profile image URL');
    }
    
    // Delegate to repository abstraction
    return await this.repository.updateMe(command);
  }

  async getMyItems() {
    return await this.repository.getMyItems();
  }

  private isValidImageUrl(url: string): boolean {
    // Business logic for URL validation
    return url.startsWith('https://') && url.includes('.');
  }
}

/*
 * Benefits of this approach:
 * 
 * 1. DIP Compliance:
 *    - High-level modules (components, services) don't depend on low-level modules (repositories, APIs)
 *    - Both depend on abstractions (interfaces)
 *    - Abstractions don't depend on details
 * 
 * 2. ISP Compliance:
 *    - UpdateProfileCommand only includes mutable fields
 *    - IUserRepository focused on data access only
 *    - IUserService focused on business operations only
 * 
 * 3. Testability:
 *    - Easy to mock IUserService for component testing
 *    - Easy to mock IUserRepository for service testing
 * 
 * 4. Flexibility:
 *    - Can swap implementations without changing dependents
 *    - Can add new features by extending interfaces
 */