/**
 * Axios Implementation of IApiClient (Dependency Inversion Principle)
 * 
 * Concrete implementation following Single Responsibility Principle:
 * - Handles HTTP requests via Axios
 * - Integrates with token storage via dependency injection
 * - Normalizes 401 errors to AuthenticationError
 * - Provides consistent error handling
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { IApiClient } from './IApiClient';
import { ApiError, AuthenticationError } from './IApiClient';

/**
 * Token storage interface for dependency injection (DIP)
 * Allows testing and different storage implementations
 */
interface ITokenStorage {
  getToken(): string | null;
  setToken(token: string | null): void;
  clearToken(): void;
}

/**
 * Axios-based implementation of IApiClient interface
 * Follows SRP and DIP by depending on abstractions, not concrete token storage
 */
export class AxiosApiClient implements IApiClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly tokenStorage: ITokenStorage;

  constructor(tokenStorage: ITokenStorage) {
    this.tokenStorage = tokenStorage;

    // Initialize Axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api',
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Set initial auth header if token exists
    this.initializeAuthHeader();

    // Request interceptor to add authentication header
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.tokenStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and 401 normalization
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = this.normalizeError(error);
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Initialize authorization header from token storage
   * Called during construction to sync with persisted token
   */
  private initializeAuthHeader(): void {
    const token = this.tokenStorage.getToken();
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Perform HTTP GET request
   */
  async get<T = unknown>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url);
      return response.data;
    } catch (error) {
      throw error; // Already normalized by interceptor
    }
  }

  /**
   * Perform HTTP POST request
   */
  async post<T = unknown>(url: string, body?: unknown): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, body);
      return response.data;
    } catch (error) {
      throw error; // Already normalized by interceptor
    }
  }

  /**
   * Perform HTTP PUT request
   */
  async put<T = unknown>(url: string, body?: unknown): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, body);
      return response.data;
    } catch (error) {
      throw error; // Already normalized by interceptor
    }
  }

  /**
   * Perform HTTP DELETE request
   */
  async delete<T = unknown>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url);
      return response.data;
    } catch (error) {
      throw error; // Already normalized by interceptor
    }
  }

  /**
   * Set authentication token for subsequent requests
   * Updates both Axios defaults and persistent storage via DIP
   * @param token JWT token string or null to clear
   */
  setAuthToken(token: string | null): void {
    // Update persistent storage via injected dependency
    this.tokenStorage.setToken(token);
    
    // Update Axios default headers
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Set authentication token for subsequent requests
   * @deprecated Use setAuthToken instead for DIP compliance
   * @param token JWT token string or null to clear
   */
  setToken(token: string | null): void {
    this.setAuthToken(token);
  }

  /**
   * Get current authentication token from storage
   * @returns Current token or null if not set
   */
  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  /**
   * Normalize Axios errors to consistent ApiError format
   * Special handling for 401 status codes (AuthenticationError)
   * Ensures consistent error shape across the application
   */
  private normalizeError(error: AxiosError): ApiError | AuthenticationError {
    const status = error.response?.status ?? 0;
    const statusText = error.response?.statusText ?? 'Unknown Error';
    const url = error.config?.url ?? 'unknown';
    const data = error.response?.data;

    // Normalize all 401 errors to standard AuthenticationError shape
    if (status === 401) {
      const authError = new AuthenticationError(url, data);
      
      // Clear token on 401 to prevent retry loops
      this.tokenStorage.clearToken();
      delete this.axiosInstance.defaults.headers.common['Authorization'];
      
      return authError;
    }

    // Create generic ApiError for other HTTP errors
    const message = this.extractErrorMessage(error);
    return new ApiError(message, status, statusText, url, data);
  }

  /**
   * Extract meaningful error message from Axios error
   * Handles various error scenarios (network, timeout, HTTP errors)
   */
  private extractErrorMessage(error: AxiosError): string {
    // Network or timeout errors
    if (!error.response) {
      if (error.code === 'ECONNREFUSED') {
        return 'Unable to connect to server. Please check your connection.';
      }
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout. Please try again.';
      }
      return error.message || 'Network error occurred';
    }

    // HTTP errors with response
    const status = error.response.status;
    const data = error.response.data as any;

    // Extract message from response data if available
    if (data?.message) {
      return data.message;
    }

    if (data?.detail) {
      return data.detail;
    }

    if (data?.title) {
      return data.title;
    }

    // Fallback to generic HTTP status messages
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Authentication required.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict occurred.';
      case 422:
        return 'Validation failed.';
      case 500:
        return 'Internal server error.';
      default:
        return `HTTP ${status}: ${error.response.statusText}`;
    }
  }
}

/**
 * Default instance for application use
 * Singleton pattern with injected token storage dependency
 * Uses concrete token storage implementation while maintaining DIP
 */
import * as tokenStorage from '../../utils/tokenStorage';

// Create token storage adapter that conforms to ITokenStorage interface
const tokenStorageAdapter: ITokenStorage = {
  getToken: tokenStorage.getToken,
  setToken: tokenStorage.setToken,
  clearToken: tokenStorage.clearToken,
};

export const apiClient = new AxiosApiClient(tokenStorageAdapter);

/*
 * Enhanced Architecture Benefits with DIP Integration:
 * 
 * 1. Dependency Inversion Principle (DIP):
 *    - Depends on ITokenStorage abstraction, not concrete implementation
 *    - Allows easy testing with mock token storage
 *    - Enables different storage strategies without code changes
 * 
 * 2. Single Responsibility Principle (SRP):
 *    - HTTP client only handles HTTP communication
 *    - Token storage handles persistence concerns
 *    - Clear separation of concerns
 * 
 * 3. Automatic Token Management:
 *    - Initializes auth headers from persistent storage
 *    - Updates both Axios defaults and storage atomically
 *    - Auto-clears tokens on 401 responses
 * 
 * 4. Framework Agnostic:
 *    - No React, Redux, or UI framework dependencies
 *    - Pure infrastructure layer component
 *    - Can be used in any JavaScript environment
 * 
 * 5. Consistent Error Handling:
 *    - Normalizes 401 responses to AuthenticationError
 *    - Maintains consistent error shapes
 *    - Automatic token cleanup on authentication failures
 * 
 * Usage:
 * 
 * // Tokens are automatically loaded from storage on initialization
 * await apiClient.get('/profile');
 * 
 * // Set token (updates both Axios and storage)
 * apiClient.setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * 
 * // Token is automatically included in subsequent requests
 * await apiClient.post('/items', { title: 'New Item' });
 * 
 * // 401 responses automatically clear tokens and throw AuthenticationError
 */