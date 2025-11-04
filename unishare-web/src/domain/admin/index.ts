/**
 * Admin Domain Layer Exports
 * 
 * Centralized exports for admin domain components
 * Following Clean Architecture and SOLID principles
 */

// Domain Service
export { 
  AdminService, 
  createAdminService,
  AdminDomainError,
  AdminValidationError,
  AdminAuthorizationError,
  AdminBusinessRuleError,
  AdminInfrastructureError
} from './adminService';

// Domain Contracts
export type { 
  IAdminRepository, 
  IAdminService,
  AdminOperationResult,
  AdminDeleteResult,
  AdminBanResult
} from './contracts';

// Test utilities (for development/testing)
export { 
  MockAdminRepository, 
  AdminServiceTestScenarios, 
  ExtendedAdminService,
  AdminServiceExamples 
} from './adminService.test';