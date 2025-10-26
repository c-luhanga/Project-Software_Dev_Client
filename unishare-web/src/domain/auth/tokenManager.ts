import type { ITokenManager } from './IAuthService';

/**
 * Token manager implementation using localStorage
 * Follows Single Responsibility Principle - only handles token storage
 */
export class LocalStorageTokenManager implements ITokenManager {
  private readonly tokenKey = 'auth_token';

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Failed to store token:', error);
      // Could implement fallback storage strategy here
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  clearToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }
}

/**
 * In-memory token manager for testing or environments without localStorage
 */
export class MemoryTokenManager implements ITokenManager {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
  }
}

/**
 * Factory function to create appropriate token manager
 * Can be extended to choose implementation based on environment
 */
export const createTokenManager = (): ITokenManager => {
  // Check if localStorage is available
  if (typeof Storage !== 'undefined' && window.localStorage) {
    return new LocalStorageTokenManager();
  }
  
  // Fallback to memory storage
  return new MemoryTokenManager();
};