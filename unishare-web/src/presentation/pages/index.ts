/**
 * Presentation pages module exports
 * Provides clean interface for all page-level components
 */

// Auth pages
export * from './auth';

// Main pages
export { HomePage } from './HomePage';

// Re-export commonly used pages
export { LoginPage } from './auth/LoginPage';
export { RegisterPage } from './auth/RegisterPage';