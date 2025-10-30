/**
 * Core Layer Exports
 * 
 * Dependency injection and application core functionality
 */

// DI Container
export { container } from './container';
export {
  getApiClient,
  getAuthRepository,
  getAuthService,
  getAuthValidator,
  getTokenManager,
  getUserRepository,
  getUserService
} from './container';

// Types
export type { IApiClient } from '../infrastructure/http/IApiClient';
export type { IUserRepository, IUserService } from '../domain/user/contracts';
export type { IAuthService, IAuthValidator, ITokenManager } from '../domain/auth/IAuthService';