import type { LoginRequest, RegisterRequest, LoginResponse, User } from '../../types/auth';

/**
 * Auth service interface following Dependency Inversion Principle
 * Defines contract for domain-level auth operations
 */
export interface IAuthService {
  /**
   * Authenticate user with validation and token management
   * @param credentials - Login request data
   * @returns Promise with login response
   */
  login(credentials: LoginRequest): Promise<LoginResponse>;

  /**
   * Register new user with validation and auto-login
   * @param userData - Registration request data
   * @returns Promise with login response for newly created user
   */
  register(userData: RegisterRequest): Promise<LoginResponse>;

  /**
   * Get current authenticated user information
   * @returns Promise with current user data
   */
  getCurrentUser(): Promise<User>;

  /**
   * Refresh authentication token
   * @returns Promise with new login response
   */
  refreshToken(): Promise<LoginResponse>;

  /**
   * Logout current user and clear session
   * @returns Promise that resolves when logout is complete
   */
  logout(): Promise<void>;

  /**
   * Check if user is currently authenticated
   * @returns boolean indicating auth status
   */
  isAuthenticated(): boolean;
}

/**
 * Token management callback interface for dependency injection
 * Allows service to remain agnostic about token storage implementation
 */
export interface ITokenManager {
  /**
   * Set authentication token
   * @param token - The token to store
   */
  setToken(token: string): void;

  /**
   * Get current authentication token
   * @returns Current token or null if not set
   */
  getToken(): string | null;

  /**
   * Clear authentication token
   */
  clearToken(): void;
}

/**
 * Validation interfaces for extensibility (Open/Closed Principle)
 */
export interface IAuthValidator {
  /**
   * Validate login credentials
   * @param credentials - Login data to validate
   * @throws ValidationError if invalid
   */
  validateLogin(credentials: LoginRequest): void;

  /**
   * Validate registration data
   * @param userData - Registration data to validate
   * @throws ValidationError if invalid
   */
  validateRegister(userData: RegisterRequest): void;
}

/**
 * Custom validation error for auth operations
 */
export class AuthValidationError extends Error {
  public readonly field?: string;
  public readonly code?: string;

  constructor(message: string, field?: string, code?: string) {
    super(message);
    this.name = 'AuthValidationError';
    this.field = field;
    this.code = code;
  }
}