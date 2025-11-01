/**
 * Token Storage Utility (Single Responsibility Principle)
 * 
 * Responsibilities:
 * - Persist JWT tokens to sessionStorage
 * - Maintain in-memory cache for performance
 * - Provide simple CRUD operations for tokens
 * 
 * Does NOT:
 * - Handle authentication logic
 * - Validate token format or expiration
 * - Integrate with any specific framework
 * - Manage application state
 */

const STORAGE_KEY = 'unishare.jwt';

/**
 * In-memory token cache to avoid repeated storage reads
 * Performance optimization following SRP
 */
let memoryCache: string | null = null;

/**
 * Set authentication token
 * Persists to both memory cache and sessionStorage
 * 
 * @param token - JWT token string or null to clear
 */
export function setToken(token: string | null): void {
  memoryCache = token;
  
  if (token === null) {
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, token);
  }
}

/**
 * Get authentication token
 * Returns from memory cache for performance
 * 
 * @returns JWT token string or null if not set
 */
export function getToken(): string | null {
  return memoryCache;
}

/**
 * Clear authentication token
 * Removes from both memory cache and sessionStorage
 */
export function clearToken(): void {
  memoryCache = null;
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Rehydrate token from storage into memory
 * Should be called once at application start
 * Ensures memory cache is synchronized with persistent storage
 */
export function rehydrateTokenOnLoad(): void {
  try {
    const storedToken = sessionStorage.getItem(STORAGE_KEY);
    memoryCache = storedToken;
  } catch (error) {
    // Handle cases where sessionStorage is unavailable (SSR, private browsing, etc.)
    console.warn('Failed to rehydrate token from storage:', error);
    memoryCache = null;
  }
}

/**
 * Utility Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Only responsible for token persistence
 *    - No authentication, validation, or business logic
 *    - Clean separation of concerns
 * 
 * 2. Framework Agnostic:
 *    - No React, Redux, or framework dependencies
 *    - Can be used in any JavaScript environment
 *    - Pure utility functions
 * 
 * 3. Performance Optimized:
 *    - In-memory cache prevents repeated storage reads
 *    - Synchronous operations for better UX
 *    - Minimal overhead
 * 
 * 4. Error Resilient:
 *    - Handles storage unavailability gracefully
 *    - Fail-safe operations
 *    - No throwing on edge cases
 * 
 * Usage Example:
 * 
 * // At app startup
 * rehydrateTokenOnLoad();
 * 
 * // Set token after login
 * setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * 
 * // Get token for API calls
 * const token = getToken();
 * 
 * // Clear token on logout
 * clearToken();
 */