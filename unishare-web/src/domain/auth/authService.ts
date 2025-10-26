import type { IAuthRepository } from '../../infrastructure/auth/IAuthRepository';
import type { 
  IAuthService, 
  IAuthValidator, 
  ITokenManager 
} from './IAuthService';
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  User 
} from '../../types/auth';

/**
 * Auth service implementation following SOLID principles
 * 
 * Single Responsibility: Orchestrates auth operations and validation
 * Open/Closed: Extensible through dependency injection (validators, token manager)
 * Dependency Inversion: Depends on abstractions (IAuthRepository, IAuthValidator, ITokenManager)
 */
export class AuthService implements IAuthService {
  private readonly authRepository: IAuthRepository;
  private readonly validator: IAuthValidator;
  private readonly tokenManager: ITokenManager;

  constructor(
    authRepository: IAuthRepository,
    validator: IAuthValidator,
    tokenManager: ITokenManager
  ) {
    this.authRepository = authRepository;
    this.validator = validator;
    this.tokenManager = tokenManager;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Validate input (can be extended with additional validators)
    this.validator.validateLogin(credentials);

    try {
      // Call repository for authentication
      const response = await this.authRepository.login(credentials);

      // Handle token persistence through injected callback
      this.tokenManager.setToken(response.token);

      return response;
    } catch (error) {
      // Clear any existing token on failed login
      this.tokenManager.clearToken();
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    // Validate registration data
    this.validator.validateRegister(userData);

    try {
      // Call repository for user creation and auto-login
      const response = await this.authRepository.register(userData);

      // Handle token persistence
      this.tokenManager.setToken(response.token);

      return response;
    } catch (error) {
      // Ensure no token is set on failed registration
      this.tokenManager.clearToken();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    // Verify token exists before making request
    if (!this.isAuthenticated()) {
      throw new Error('User is not authenticated');
    }

    try {
      return await this.authRepository.getMe();
    } catch (error) {
      // If token is invalid, clear it
      if (this.isUnauthorizedError(error)) {
        this.tokenManager.clearToken();
      }
      throw error;
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await this.authRepository.refreshToken();

      // Update stored token
      this.tokenManager.setToken(response.token);

      return response;
    } catch (error) {
      // Clear token if refresh fails
      this.tokenManager.clearToken();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Attempt server-side logout
      await this.authRepository.logout();
    } finally {
      // Always clear local token, even if server logout fails
      this.tokenManager.clearToken();
    }
  }

  isAuthenticated(): boolean {
    const token = this.tokenManager.getToken();
    return token !== null && token.trim() !== '';
  }

  /**
   * Helper method to identify unauthorized errors
   * Can be extended to handle different error types
   */
  private isUnauthorizedError(error: unknown): boolean {
    // Check if error indicates invalid/expired token
    return (
      error instanceof Error &&
      (error.message.includes('401') || 
       error.message.includes('Unauthorized') ||
       error.message.includes('Token expired'))
    );
  }
}

/**
 * Factory function for creating AuthService with dependencies
 * Promotes dependency injection and easier testing
 */
export const createAuthService = (
  authRepository: IAuthRepository,
  validator: IAuthValidator,
  tokenManager: ITokenManager
): IAuthService => {
  return new AuthService(authRepository, validator, tokenManager);
};