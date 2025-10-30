/**
 * Axios Implementation of IApiClient (Dependency Inversion Principle)
 * 
 * Concrete implementation following Single Responsibility Principle:
 * - Handles HTTP requests via Axios
 * - Manages authentication token internally
 * - Normalizes 401 errors to AuthenticationError
 * - Provides consistent error handling
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { IApiClient } from './IApiClient';
import { ApiError, AuthenticationError } from './IApiClient';

/**
 * Axios-based implementation of IApiClient interface
 * Follows SRP by focusing solely on HTTP communication via Axios
 */
export class AxiosApiClient implements IApiClient {
  private readonly axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Initialize Axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api',
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add authentication header
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
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
   * @param token JWT token string or null to clear
   */
  setToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get current authentication token
   * @returns Current token or null if not set
   */
  getToken(): string | null {
    return this.authToken;
  }

  /**
   * Normalize Axios errors to consistent ApiError format
   * Special handling for 401 status codes (AuthenticationError)
   */
  private normalizeError(error: AxiosError): ApiError | AuthenticationError {
    const status = error.response?.status ?? 0;
    const statusText = error.response?.statusText ?? 'Unknown Error';
    const url = error.config?.url ?? 'unknown';
    const data = error.response?.data;

    // Normalize 401 errors to AuthenticationError
    if (status === 401) {
      return new AuthenticationError(url, data);
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
 * Singleton pattern for consistent client across the app
 */
export const apiClient = new AxiosApiClient();