/**
 * User Initials Utility
 * 
 * Pure utility function following Single Responsibility Principle (SRP):
 * - Only responsible for generating user initials from name/email data
 * - No external dependencies (UI, Redux, HTTP, etc.)
 * - Stateless and predictable behavior
 * - Framework-independent implementation
 */

/**
 * Generate user initials from first name, last name, or email
 * 
 * Business Rules:
 * - If both firstName and lastName are provided, use first letter of each
 * - If only firstName is provided, use first two letters (or first letter if single character)
 * - If only lastName is provided, use first two letters (or first letter if single character)
 * - If neither name is provided but email exists, use first letter of email
 * - All initials are returned in uppercase
 * - Returns empty string if no valid input is provided
 * 
 * @param firstName Optional first name
 * @param lastName Optional last name
 * @param email Optional email address (fallback)
 * @returns 1-2 uppercase initials, or empty string if no valid input
 * 
 * @example
 * ```typescript
 * getUserInitials('John', 'Doe') // Returns 'JD'
 * getUserInitials('John') // Returns 'JO'
 * getUserInitials('', 'Smith') // Returns 'SM'
 * getUserInitials(undefined, undefined, 'john@example.com') // Returns 'J'
 * getUserInitials('A') // Returns 'A'
 * getUserInitials() // Returns ''
 * ```
 */
export function getUserInitials(
  firstName?: string, 
  lastName?: string, 
  email?: string
): string {
  // Helper function to clean and validate a string
  const cleanString = (str?: string): string => {
    return (str || '').trim();
  };

  // Helper function to get first letter in uppercase
  const getFirstLetter = (str: string): string => {
    return str.length > 0 ? str[0].toUpperCase() : '';
  };

  // Helper function to get first two letters in uppercase
  const getFirstTwoLetters = (str: string): string => {
    if (str.length === 0) return '';
    if (str.length === 1) return str[0].toUpperCase();
    return (str[0] + str[1]).toUpperCase();
  };

  const cleanFirstName = cleanString(firstName);
  const cleanLastName = cleanString(lastName);
  const cleanEmail = cleanString(email);

  // Case 1: Both first and last name available
  if (cleanFirstName && cleanLastName) {
    return getFirstLetter(cleanFirstName) + getFirstLetter(cleanLastName);
  }

  // Case 2: Only first name available
  if (cleanFirstName) {
    return getFirstTwoLetters(cleanFirstName);
  }

  // Case 3: Only last name available
  if (cleanLastName) {
    return getFirstTwoLetters(cleanLastName);
  }

  // Case 4: Fallback to email
  if (cleanEmail) {
    return getFirstLetter(cleanEmail);
  }

  // Case 5: No valid input
  return '';
}

/**
 * Validate if the provided input can generate meaningful initials
 * 
 * @param firstName Optional first name
 * @param lastName Optional last name
 * @param email Optional email address
 * @returns true if initials can be generated, false otherwise
 * 
 * @example
 * ```typescript
 * canGenerateInitials('John', 'Doe') // Returns true
 * canGenerateInitials('', '', 'john@example.com') // Returns true
 * canGenerateInitials('', '', '') // Returns false
 * canGenerateInitials() // Returns false
 * ```
 */
export function canGenerateInitials(
  firstName?: string,
  lastName?: string,
  email?: string
): boolean {
  const initials = getUserInitials(firstName, lastName, email);
  return initials.length > 0;
}

/**
 * Get initials with a fallback default value
 * 
 * @param firstName Optional first name
 * @param lastName Optional last name
 * @param email Optional email address
 * @param fallback Default value if no initials can be generated (default: '?')
 * @returns User initials or fallback value
 * 
 * @example
 * ```typescript
 * getInitialsWithFallback('John', 'Doe') // Returns 'JD'
 * getInitialsWithFallback('', '', '', 'NA') // Returns 'NA'
 * getInitialsWithFallback() // Returns '?'
 * ```
 */
export function getInitialsWithFallback(
  firstName?: string,
  lastName?: string,
  email?: string,
  fallback: string = '?'
): string {
  const initials = getUserInitials(firstName, lastName, email);
  return initials || fallback;
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - getUserInitials: Only responsible for generating initials from user data
 * - canGenerateInitials: Only responsible for validating if initials can be generated
 * - getInitialsWithFallback: Only responsible for providing initials with fallback
 * - Helper functions: Each has a single, focused responsibility
 * 
 * Open/Closed Principle (OCP):
 * - Functions are closed for modification but open for extension
 * - New initials generation strategies can be added without changing existing code
 * - Fallback mechanisms can be extended without breaking existing functionality
 * 
 * Liskov Substitution Principle (LSP):
 * - All functions maintain consistent contracts and behavior
 * - Helper functions can be replaced with alternative implementations
 * - No unexpected side effects or contract violations
 * 
 * Interface Segregation Principle (ISP):
 * - Functions have minimal, focused interfaces
 * - No unnecessary parameters or complex object dependencies
 * - Each function serves a specific use case
 * 
 * Dependency Inversion Principle (DIP):
 * - No dependencies on external frameworks or libraries
 * - Pure functions that depend only on primitive types
 * - Can be used in any context (React, Vue, Node.js, etc.)
 * 
 * Benefits:
 * - Framework Independence: No React, Redux, or UI library dependencies
 * - Pure Functions: Predictable behavior with no side effects
 * - Type Safety: Full TypeScript support with proper optional handling
 * - Testability: Easy to unit test with various input combinations
 * - Reusability: Can be used across different components and contexts
 * - Performance: Lightweight with no external dependencies
 * - Maintainability: Clear logic flow and well-documented behavior
 * 
 * Usage Examples:
 * 
 * // In a React component
 * const UserAvatar = ({ user }: { user: User }) => {
 *   const initials = getUserInitials(user.firstName, user.lastName, user.email);
 *   return <Avatar>{initials}</Avatar>;
 * };
 * 
 * // In a list component
 * const ContactList = ({ contacts }: { contacts: Contact[] }) => {
 *   return (
 *     <ul>
 *       {contacts.map(contact => (
 *         <li key={contact.id}>
 *           {getInitialsWithFallback(contact.firstName, contact.lastName, contact.email)}
 *           {contact.name}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * };
 * 
 * // In a messaging system
 * const MessageBubble = ({ message }: { message: Message }) => {
 *   const senderInitials = getUserInitials(
 *     message.senderFirstName,
 *     message.senderLastName,
 *     message.senderEmail
 *   );
 *   return (
 *     <div>
 *       <Avatar>{senderInitials}</Avatar>
 *       <span>{message.content}</span>
 *     </div>
 *   );
 * };
 * 
 * // In utility services
 * class UserDisplayService {
 *   getDisplayName(user: User): string {
 *     const initials = getUserInitials(user.firstName, user.lastName, user.email);
 *     return initials ? `${user.firstName} ${user.lastName} (${initials})` : 'Unknown User';
 *   }
 * }
 * 
 * // Testing examples
 * describe('getUserInitials', () => {
 *   test('should return initials from first and last name', () => {
 *     expect(getUserInitials('John', 'Doe')).toBe('JD');
 *   });
 * 
 *   test('should handle single name gracefully', () => {
 *     expect(getUserInitials('John')).toBe('JO');
 *   });
 * 
 *   test('should fallback to email', () => {
 *     expect(getUserInitials('', '', 'john@example.com')).toBe('J');
 *   });
 * 
 *   test('should return empty string for invalid input', () => {
 *     expect(getUserInitials()).toBe('');
 *   });
 * });
 */