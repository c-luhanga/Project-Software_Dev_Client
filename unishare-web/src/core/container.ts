import type { IApiClient } from '../infrastructure/http/IApiClient';
import type { IAuthRepository } from '../infrastructure/auth/IAuthRepository';
import type { IAuthService, IAuthValidator, ITokenManager } from '../domain/auth/IAuthService';
import type { IUserRepository, IUserService } from '../domain/user/contracts';

import { AxiosApiClient } from '../infrastructure/http/axiosClient';
import { AuthRepository } from '../infrastructure/auth/authRepository';
import { AuthService } from '../domain/auth/authService';
import { AuthValidator } from '../domain/auth/authValidator';
import { UserRepository } from '../infrastructure/user/userRepository';
import { UserService } from '../domain/user/userService';

/**
 * Simple Dependency Injection Container
 * Follows Dependency Inversion Principle by wiring abstractions to concrete implementations
 * No React dependencies - pure service composition
 */
class DIContainer {
  private readonly _apiClient: IApiClient;
  private readonly _authRepository: IAuthRepository;
  private readonly _authValidator: IAuthValidator;
  private readonly _tokenManager: ITokenManager;
  private readonly _authService: IAuthService;
  private readonly _userRepository: IUserRepository;
  private readonly _userService: IUserService;

  constructor() {
    // Create API client instance (singleton)
    this._apiClient = new AxiosApiClient();

    // Create token manager that delegates to API client
    this._tokenManager = this.createApiClientTokenManager();

    // Create auth repository with API client dependency
    this._authRepository = new AuthRepository(this._apiClient);

    // Create auth validator
    this._authValidator = new AuthValidator();

    // Create auth service with all dependencies
    this._authService = new AuthService(
      this._authRepository,
      this._authValidator,
      this._tokenManager
    );

    // Create user repository with API client dependency
    this._userRepository = new UserRepository(this._apiClient);

    // Create user service with user repository dependency
    this._userService = new UserService(this._userRepository);
  }

  /**
   * Get API client instance
   */
  get apiClient(): IApiClient {
    return this._apiClient;
  }

  /**
   * Get auth repository instance
   */
  get authRepository(): IAuthRepository {
    return this._authRepository;
  }

  /**
   * Get auth service instance
   */
  get authService(): IAuthService {
    return this._authService;
  }

  /**
   * Get auth validator instance
   */
  get authValidator(): IAuthValidator {
    return this._authValidator;
  }

  /**
   * Get token manager instance
   */
  get tokenManager(): ITokenManager {
    return this._tokenManager;
  }

  /**
   * Get user repository instance
   */
  get userRepository(): IUserRepository {
    return this._userRepository;
  }

  /**
   * Get user service instance
   */
  get userService(): IUserService {
    return this._userService;
  }

  /**
   * Creates a token manager that delegates to the API client
   * This ensures token synchronization between service layer and HTTP layer
   */
  private createApiClientTokenManager(): ITokenManager {
    const apiClient = this._apiClient;

    return {
      setToken: (token: string): void => {
        apiClient.setToken(token);
      },

      getToken: (): string | null => {
        return apiClient.getToken();
      },

      clearToken: (): void => {
        apiClient.setToken(null);
      }
    };
  }
}

/**
 * Singleton container instance
 * Ensures consistent dependency graph throughout the application
 */
export const container = new DIContainer();

/**
 * Type-safe getters for common services
 * These provide convenient access while maintaining type safety
 */
export const getApiClient = (): IApiClient => container.apiClient;
export const getAuthRepository = (): IAuthRepository => container.authRepository;
export const getAuthService = (): IAuthService => container.authService;
export const getAuthValidator = (): IAuthValidator => container.authValidator;
export const getTokenManager = (): ITokenManager => container.tokenManager;
export const getUserRepository = (): IUserRepository => container.userRepository;
export const getUserService = (): IUserService => container.userService;