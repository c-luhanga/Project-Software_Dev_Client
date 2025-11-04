/**
 * Infrastructure Layer Exports
 * 
 * Centralized exports for infrastructure implementations
 * Following Clean Architecture layers
 */

// HTTP Client Infrastructure
export type { IApiClient } from './http';
export { ApiError, AuthenticationError, AxiosApiClient, apiClient } from './http';

// User Infrastructure
export { UserRepository } from './user';

// Messaging Infrastructure
export { MessagingRepository, createMessagingRepository } from './messaging/messagingRepository';