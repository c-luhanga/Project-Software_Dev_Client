import type { LoginRequest, RegisterRequest, LoginResponse, User } from '../../types/auth';

/**
 * Auth repository interface following Dependency Inversion Principle
 * Defines contract for authentication operations without implementation details
 */
export interface IAuthRepository {
  /**
   * Authenticate user with email and password
   * @param credentials - Login request data
   * @returns Promise with login response containing token and user info
   */
  login(credentials: LoginRequest): Promise<LoginResponse>;

  /**
   * Register a new user account
   * @param userData - Registration request data
   * @returns Promise with login response for newly created user
   */
  register(userData: RegisterRequest): Promise<LoginResponse>;

  /**
   * Get current authenticated user information
   * @returns Promise with current user data
   */
  getMe(): Promise<User>;

  /**
   * Refresh authentication token
   * @returns Promise with new login response
   */
  refreshToken(): Promise<LoginResponse>;

  /**
   * Logout current user (server-side cleanup if needed)
   * @returns Promise that resolves when logout is complete
   */
  logout(): Promise<void>;
}