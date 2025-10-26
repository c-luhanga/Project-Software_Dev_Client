// Generic HTTP client interface following Dependency Inversion Principle
export interface IApiClient {
  /**
   * Performs a GET request to the specified endpoint
   * @param url - The endpoint URL
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  get<T>(url: string, config?: RequestConfig): Promise<T>;

  /**
   * Performs a POST request to the specified endpoint
   * @param url - The endpoint URL
   * @param data - The request payload
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;

  /**
   * Performs a PUT request to the specified endpoint
   * @param url - The endpoint URL
   * @param data - The request payload
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;

  /**
   * Performs a DELETE request to the specified endpoint
   * @param url - The endpoint URL
   * @param config - Optional request configuration
   * @returns Promise with the response data
   */
  delete<T>(url: string, config?: RequestConfig): Promise<T>;

  /**
   * Sets the authentication token for subsequent requests
   * @param token - The authentication token
   */
  setAuthToken(token: string): void;

  /**
   * Gets the current authentication token
   * @returns The current token or null if not set
   */
  getAuthToken(): string | null;

  /**
   * Removes the authentication token
   */
  clearAuthToken(): void;
}

// Generic request configuration interface
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
}

// Generic API error interface
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}