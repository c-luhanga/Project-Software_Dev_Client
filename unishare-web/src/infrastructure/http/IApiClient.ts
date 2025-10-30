/**
 * HTTP Client Abstraction (Dependency Inversion Principle)
 * 
 * Pure interface defining HTTP operations without implementation details
 * Allows dependency injection and easy testing/mocking
 * No framework-specific types (axios, fetch, etc.) - pure abstraction
 */

/**
 * Generic HTTP client interface following DIP
 * High-level modules depend on this abstraction, not concrete implementations
 */
export interface IApiClient {
  /**
   * Perform HTTP GET request
   * @param url Relative or absolute URL
   * @returns Promise resolving to typed response data
   * @throws Error for network/HTTP errors
   */
  get<T = unknown>(url: string): Promise<T>;

  /**
   * Perform HTTP POST request
   * @param url Relative or absolute URL
   * @param body Optional request body
   * @returns Promise resolving to typed response data
   * @throws Error for network/HTTP errors
   */
  post<T = unknown>(url: string, body?: unknown): Promise<T>;

  /**
   * Perform HTTP PUT request
   * @param url Relative or absolute URL
   * @param body Optional request body
   * @returns Promise resolving to typed response data
   * @throws Error for network/HTTP errors
   */
  put<T = unknown>(url: string, body?: unknown): Promise<T>;

  /**
   * Perform HTTP DELETE request
   * @param url Relative or absolute URL
   * @returns Promise resolving to typed response data
   * @throws Error for network/HTTP errors
   */
  delete<T = unknown>(url: string): Promise<T>;

  /**
   * Set authentication token for subsequent requests
   * @param token JWT token string or null to clear
   */
  setToken(token: string | null): void;
}

/**
 * HTTP error with structured information
 * Provides consistent error format across different HTTP client implementations
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;
  public readonly data?: unknown;

  constructor(
    message: string,
    status: number,
    statusText: string,
    url: string,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.data = data;
  }
}

/**
 * Authentication error (401) with specific handling
 * Allows application to distinguish auth failures from other API errors
 */
export class AuthenticationError extends ApiError {
  constructor(url: string, data?: unknown) {
    super('Authentication required', 401, 'Unauthorized', url, data);
    this.name = 'AuthenticationError';
  }
}