/**
 * Admin Infrastructure Layer Exports
 * 
 * Centralized exports for admin-related infrastructure components
 * Following Clean Architecture and SOLID principles
 */

// Admin Repository
export { AdminRepository, createAdminRepository } from './adminRepository';

// Test utilities (for development/testing)
export { 
  MockApiClient, 
  AdminRepositoryTestScenarios, 
  AdminService,
  createProductionAdminRepository 
} from './adminRepository.test';