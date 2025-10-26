import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { IApiClient, RequestConfig, ApiError } from './IApiClient';

/**
 * Axios implementation of IApiClient following Single Responsibility Principle
 * Handles HTTP requests and token management internally
 */
export class AxiosApiClient implements IApiClient {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Initialize axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor to attach authorization header
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Response interceptor to normalize errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Normalize axios errors to generic ApiError format
   */
  private normalizeError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    };

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      apiError.message = (data as any)?.message || `HTTP ${status} Error`;
      apiError.status = status;
      apiError.details = data;
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'Network error - no response received';
    }

    return apiError;
  }

  /**
   * Convert generic RequestConfig to AxiosRequestConfig
   */
  private mapConfig(config?: RequestConfig): AxiosRequestConfig {
    if (!config) return {};

    return {
      headers: config.headers,
      params: config.params,
      timeout: config.timeout,
    };
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, this.mapConfig(config));
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, this.mapConfig(config));
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, this.mapConfig(config));
    return response.data;
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, this.mapConfig(config));
    return response.data;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    // Optionally persist to localStorage for session management
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    // Return current token or retrieve from localStorage if not set
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }
}

// Export singleton instance for easy consumption
export const apiClient = new AxiosApiClient();