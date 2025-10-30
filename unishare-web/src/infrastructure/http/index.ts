/**
 * HTTP Infrastructure Layer Exports
 * 
 * Clean exports for HTTP client abstraction and implementations
 * Following Dependency Inversion Principle
 */

// HTTP Client Abstraction
export type { IApiClient } from './IApiClient';
export { ApiError, AuthenticationError } from './IApiClient';

// Axios Implementation
export { AxiosApiClient, apiClient } from './axiosClient';