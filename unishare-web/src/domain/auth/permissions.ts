/**
 * Domain Permissions and Role Utilities
 * 
 * Pure domain logic following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles role and permission logic
 * - Open/Closed Principle (OCP): Open for extension with new roles/permissions
 * 
 * Framework Independence:
 * - No UI, Redux, React, or external framework dependencies
 * - Pure TypeScript/JavaScript functions
 * - Can be used in any context (frontend, backend, testing)
 */

/**
 * User roles constants
 * Defines all possible user roles in the system
 */
export const UserRoles = {
  USER: 'user',
  ADMIN: 'admin'
} as const;

/**
 * User role type derived from UserRoles constants
 */
export type UserRole = typeof UserRoles[keyof typeof UserRoles];

/**
 * User profile interface for permission checking
 * Minimal interface following Interface Segregation Principle
 */
export interface UserProfile {
  readonly userId: number;
  readonly isAdmin: boolean;
}

/**
 * Item detail interface for permission checking
 * Minimal interface with only fields needed for permissions
 */
export interface ItemDetail {
  readonly itemId: number;
  readonly sellerId: number;
  readonly statusId: number;
}

/**
 * Permission checking utilities
 * Pure functions that determine user capabilities based on roles and ownership
 */

/**
 * Check if user can edit an item
 * 
 * Business Rules:
 * - Item owner (sellerId matches userId) can edit their own items
 * - Admins can edit any item
 * - Regular users cannot edit items they don't own
 * 
 * @param user User profile with ID and admin status
 * @param item Item details with seller information
 * @returns true if user has edit permissions, false otherwise
 * 
 * @example
 * ```typescript
 * const user = { userId: 123, isAdmin: false };
 * const item = { itemId: 456, sellerId: 123, statusId: 1 };
 * canEditItem(user, item); // Returns true (owner)
 * 
 * const adminUser = { userId: 789, isAdmin: true };
 * canEditItem(adminUser, item); // Returns true (admin)
 * 
 * const otherUser = { userId: 999, isAdmin: false };
 * canEditItem(otherUser, item); // Returns false (not owner, not admin)
 * ```
 */
export function canEditItem(user: UserProfile, item: ItemDetail): boolean {
  // Input validation
  if (!user || !item) {
    return false;
  }

  // Admins can edit any item
  if (user.isAdmin) {
    return true;
  }

  // Item owners can edit their own items
  return user.userId === item.sellerId;
}

/**
 * Check if user can mark an item as sold
 * 
 * Business Rules:
 * - Item owner can mark their item as sold
 * - Admins can mark any item as sold
 * - Only active (statusId === 1) or pending (statusId === 2) items can be marked as sold
 * 
 * @param user User profile with ID and admin status
 * @param item Item details with seller and status information
 * @returns true if user can mark item as sold, false otherwise
 * 
 * @example
 * ```typescript
 * const user = { userId: 123, isAdmin: false };
 * const activeItem = { itemId: 456, sellerId: 123, statusId: 1 };
 * canMarkSold(user, activeItem); // Returns true
 * 
 * const pendingItem = { itemId: 789, sellerId: 123, statusId: 2 };
 * canMarkSold(user, pendingItem); // Returns true
 * 
 * const soldItem = { itemId: 456, sellerId: 123, statusId: 3 };
 * canMarkSold(user, soldItem); // Returns false (already sold)
 * ```
 */
export function canMarkSold(user: UserProfile, item: ItemDetail): boolean {
  // Input validation
  if (!user || !item) {
    return false;
  }

  // Item must be active (statusId === 1) or pending (statusId === 2) to be marked as sold
  if (item.statusId !== 1 && item.statusId !== 2) {
    return false;
  }

  // Admins can mark any active/pending item as sold
  if (user.isAdmin) {
    return true;
  }

  // Item owners can mark their own active/pending items as sold
  return user.userId === item.sellerId;
}

/**
 * Check if user can perform moderation actions
 * 
 * Business Rules:
 * - Only admins can perform moderation actions
 * - Regular users cannot moderate content
 * 
 * @param user User profile with admin status
 * @returns true if user can moderate, false otherwise
 * 
 * @example
 * ```typescript
 * const adminUser = { userId: 123, isAdmin: true };
 * canModerate(adminUser); // Returns true
 * 
 * const regularUser = { userId: 456, isAdmin: false };
 * canModerate(regularUser); // Returns false
 * ```
 */
export function canModerate(user: UserProfile): boolean {
  // Input validation
  if (!user) {
    return false;
  }

  // Only admins can moderate
  return user.isAdmin;
}

/**
 * Check if user can delete an item
 * 
 * Business Rules:
 * - Item owner can delete their own items
 * - Admins can delete any item
 * - Deleted/withdrawn items cannot be deleted again
 * 
 * @param user User profile with ID and admin status
 * @param item Item details with seller and status information
 * @returns true if user can delete item, false otherwise
 * 
 * @example
 * ```typescript
 * const user = { userId: 123, isAdmin: false };
 * const item = { itemId: 456, sellerId: 123, statusId: 1 };
 * canDeleteItem(user, item); // Returns true
 * ```
 */
export function canDeleteItem(user: UserProfile, item: ItemDetail): boolean {
  // Input validation
  if (!user || !item) {
    return false;
  }

  // Cannot delete already withdrawn items (statusId === 4)
  if (item.statusId === 4) {
    return false;
  }

  // Admins can delete any non-withdrawn item
  if (user.isAdmin) {
    return true;
  }

  // Item owners can delete their own non-withdrawn items
  return user.userId === item.sellerId;
}

/**
 * Check if user can view item management actions
 * 
 * Business Rules:
 * - Item owner can see management actions for their items
 * - Admins can see management actions for any item
 * - Other users cannot see management actions
 * 
 * @param user User profile with ID and admin status
 * @param item Item details with seller information
 * @returns true if user can see management actions, false otherwise
 */
export function canViewItemActions(user: UserProfile, item: ItemDetail): boolean {
  // Input validation
  if (!user || !item) {
    return false;
  }

  // Admins can view actions for any item
  if (user.isAdmin) {
    return true;
  }

  // Item owners can view actions for their own items
  return user.userId === item.sellerId;
}

/**
 * Check if user has a specific role
 * 
 * @param user User profile with admin status
 * @param role Role to check
 * @returns true if user has the specified role, false otherwise
 */
export function hasRole(user: UserProfile, role: UserRole): boolean {
  // Input validation
  if (!user) {
    return false;
  }

  switch (role) {
    case UserRoles.ADMIN:
      return user.isAdmin;
    case UserRoles.USER:
      return !user.isAdmin;
    default:
      return false;
  }
}

/**
 * Get user's role
 * 
 * @param user User profile with admin status
 * @returns User's role or null if invalid user
 */
export function getUserRole(user: UserProfile): UserRole | null {
  if (!user) {
    return null;
  }

  return user.isAdmin ? UserRoles.ADMIN : UserRoles.USER;
}

/**
 * Check if user is item owner
 * 
 * @param user User profile with ID
 * @param item Item details with seller information
 * @returns true if user owns the item, false otherwise
 */
export function isItemOwner(user: UserProfile, item: ItemDetail): boolean {
  // Input validation
  if (!user || !item) {
    return false;
  }

  return user.userId === item.sellerId;
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - Each function has a single, focused responsibility
 * - canEditItem: Only determines edit permissions
 * - canMarkSold: Only determines sell permissions
 * - canModerate: Only determines moderation permissions
 * - hasRole: Only checks role membership
 * - Separate concerns: permissions vs. roles vs. ownership
 * 
 * Open/Closed Principle (OCP):
 * - Functions are closed for modification but open for extension
 * - New permission functions can be added without changing existing ones
 * - New roles can be added to UserRoles constants without breaking existing code
 * - Business rules can be extended through new functions
 * 
 * Liskov Substitution Principle (LSP):
 * - All functions accept interface types that can be substituted
 * - UserProfile and ItemDetail interfaces are stable contracts
 * - Functions behave consistently regardless of concrete implementations
 * 
 * Interface Segregation Principle (ISP):
 * - UserProfile: Only contains fields needed for permissions (userId, isAdmin)
 * - ItemDetail: Only contains fields needed for item permissions (itemId, sellerId, statusId)
 * - No unnecessary dependencies or bloated interfaces
 * 
 * Dependency Inversion Principle (DIP):
 * - Functions depend on abstractions (interfaces) not concrete implementations
 * - No dependencies on UI frameworks, Redux, or external libraries
 * - Can be used in any context that provides UserProfile and ItemDetail data
 * 
 * Benefits:
 * - Framework Independence: No React, Redux, or UI dependencies
 * - Pure Functions: Predictable behavior with no side effects
 * - Type Safety: Full TypeScript support with clear interfaces
 * - Testability: Easy to unit test with various input combinations
 * - Reusability: Can be used across different parts of the application
 * - Maintainability: Clear business rules with focused responsibilities
 * - Performance: Lightweight with no external dependencies
 * - Security: Centralized permission logic reduces authorization bugs
 * 
 * Usage Examples:
 * 
 * // In a React component
 * const ItemActions = ({ user, item }: { user: UserProfile; item: ItemDetail }) => {
 *   const canEdit = canEditItem(user, item);
 *   const canSell = canMarkSold(user, item);
 *   
 *   return (
 *     <div>
 *       {canEdit && <EditButton onClick={handleEdit} />}
 *       {canSell && <MarkSoldButton onClick={handleMarkSold} />}
 *     </div>
 *   );
 * };
 * 
 * // In a service layer
 * class ItemService {
 *   async updateItem(user: UserProfile, item: ItemDetail, updates: Partial<ItemDetail>) {
 *     if (!canEditItem(user, item)) {
 *       throw new Error('Permission denied: Cannot edit item');
 *     }
 *     return this.itemRepository.update(item.itemId, updates);
 *   }
 * }
 * 
 * // In Redux middleware
 * const permissionMiddleware: Middleware = (store) => (next) => (action) => {
 *   if (action.type === 'items/markSold') {
 *     const { user, item } = action.payload;
 *     if (!canMarkSold(user, item)) {
 *       return next({ type: 'items/markSoldFailed', error: 'Permission denied' });
 *     }
 *   }
 *   return next(action);
 * };
 * 
 * // Testing examples
 * describe('Permission utilities', () => {
 *   const owner: UserProfile = { userId: 123, isAdmin: false };
 *   const admin: UserProfile = { userId: 456, isAdmin: true };
 *   const other: UserProfile = { userId: 789, isAdmin: false };
 *   const item: ItemDetail = { itemId: 1, sellerId: 123, statusId: 1 };
 * 
 *   test('canEditItem allows owners and admins', () => {
 *     expect(canEditItem(owner, item)).toBe(true);
 *     expect(canEditItem(admin, item)).toBe(true);
 *     expect(canEditItem(other, item)).toBe(false);
 *   });
 * 
 *   test('canMarkSold requires active status', () => {
 *     const soldItem = { ...item, statusId: 3 };
 *     expect(canMarkSold(owner, item)).toBe(true);
 *     expect(canMarkSold(owner, soldItem)).toBe(false);
 *   });
 * 
 *   test('canModerate is admin-only', () => {
 *     expect(canModerate(admin)).toBe(true);
 *     expect(canModerate(owner)).toBe(false);
 *   });
 * });
 */