/**
 * Error Mapper Demo and Validation
 * 
 * This file demonstrates how the error mapping utility works
 * and can be used to validate the mapping behavior manually.
 */

import { 
  mapError, 
  getErrorMessage, 
  isErrorRetryable, 
  getErrorCategory,
  ErrorCategory
} from '../errorMapper';

/**
 * Demo function to test error mapping scenarios
 * Run this in the browser console or Node.js to see results
 */
export function demoErrorMapping() {
  console.log('=== Error Mapping Demo ===\n');

  // Test various error scenarios
  const testCases = [
    {
      name: 'Network Error',
      error: 'Network Error',
    },
    {
      name: 'Invalid Credentials',
      error: 'Invalid credentials',
    },
    {
      name: '401 Status Code',
      error: { message: 'Unauthorized', status: 401 },
    },
    {
      name: 'Email Already Exists',
      error: 'Email already exists',
    },
    {
      name: 'Server Error',
      error: { message: 'Internal server error', status: 500 },
    },
    {
      name: 'Validation Error',
      error: { message: 'Required field missing', status: 400 },
    },
    {
      name: 'Unknown Error',
      error: 'Something weird happened',
    },
    {
      name: 'Null Error',
      error: null,
    },
  ];

  testCases.forEach(({ name, error }) => {
    console.log(`--- ${name} ---`);
    const mapped = mapError(error);
    console.log('Original:', error);
    console.log('Mapped Message:', mapped.message);
    console.log('Category:', mapped.category);
    console.log('Retryable:', mapped.isRetryable);
    console.log('Technical Details:', mapped.technicalDetails);
    console.log('');
  });

  // Test convenience functions
  console.log('=== Convenience Functions ===\n');
  console.log('getErrorMessage("Network Error"):', getErrorMessage('Network Error'));
  console.log('isErrorRetryable("Network Error"):', isErrorRetryable('Network Error'));
  console.log('getErrorCategory("Invalid credentials"):', getErrorCategory('Invalid credentials'));
  console.log('');

  // Test category mappings
  console.log('=== Category Mappings ===\n');
  Object.values(ErrorCategory).forEach(category => {
    console.log(`${category.toUpperCase()}:`, category);
  });
}

/**
 * Validation function to check specific error scenarios
 */
export function validateErrorMappings() {
  const validations = [
    {
      test: 'Network errors should be retryable',
      assertion: () => isErrorRetryable('Network Error') === true,
    },
    {
      test: 'Auth errors should not be retryable',
      assertion: () => isErrorRetryable('Invalid credentials') === false,
    },
    {
      test: '401 status should map to authentication category',
      assertion: () => getErrorCategory({ message: 'Unauthorized', status: 401 }) === ErrorCategory.AUTHENTICATION,
    },
    {
      test: '500 status should map to server category',
      assertion: () => getErrorCategory({ message: 'Server error', status: 500 }) === ErrorCategory.SERVER,
    },
    {
      test: 'Specific messages should be mapped correctly',
      assertion: () => getErrorMessage('Invalid credentials') === 'The email or password you entered is incorrect.',
    },
    {
      test: 'Null errors should be handled gracefully',
      assertion: () => getErrorCategory(null) === ErrorCategory.UNKNOWN,
    },
  ];

  console.log('=== Validation Results ===\n');
  let passed = 0;
  let failed = 0;

  validations.forEach(({ test, assertion }) => {
    try {
      const result = assertion();
      if (result) {
        console.log(`✅ PASS: ${test}`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${test}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test} - ${error}`);
      failed++;
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Example usage for UI components
 */
export function uiIntegrationExample() {
  console.log('=== UI Integration Example ===\n');

  // Simulate a login error scenario
  const loginError = { message: 'Invalid credentials', status: 401 };
  const mapped = mapError(loginError);

  console.log('1. Login Error Scenario:');
  console.log('   User sees:', mapped.message);
  console.log('   Show retry button:', mapped.isRetryable);
  console.log('   Error category:', mapped.category);
  console.log('');

  // Simulate a network error scenario
  const networkError = 'Network Error';
  const networkMapped = mapError(networkError);

  console.log('2. Network Error Scenario:');
  console.log('   User sees:', networkMapped.message);
  console.log('   Show retry button:', networkMapped.isRetryable);
  console.log('   Error category:', networkMapped.category);
  console.log('');

  // Example of how to use in a component
  console.log('3. Component Usage Pattern:');
  console.log(`
    const { getErrorConfig, canRetry } = useErrorHandler();
    const config = getErrorConfig(authError);
    
    return (
      <ErrorDisplay
        error={authError}
        onRetry={canRetry(authError) ? handleRetry : undefined}
        severity={config?.severity}
      />
    );
  `);
}

// Export demo functions for manual testing
if (typeof window !== 'undefined') {
  // Browser environment - add to window for console access
  (window as any).errorMapperDemo = {
    demo: demoErrorMapping,
    validate: validateErrorMappings,
    uiExample: uiIntegrationExample,
  };
}