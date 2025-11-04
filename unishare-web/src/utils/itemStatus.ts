/**
 * Item Status Constants
 * 
 * Centralized constants for item status values to ensure consistency
 * across the application and match backend API values.
 */

/**
 * Item status enumeration matching backend values
 * Based on backend API documentation:
 * - 1 = Active (available for purchase)
 * - 2 = Pending (awaiting review or processing)
 * - 3 = Sold (no longer available)
 * - 4 = Withdrawn (removed by owner)
 */
export const ITEM_STATUS = {
  ACTIVE: 1,
  PENDING: 2, 
  SOLD: 3,
  WITHDRAWN: 4
} as const;

export type ItemStatusType = typeof ITEM_STATUS[keyof typeof ITEM_STATUS];

/**
 * Get human-readable status label
 */
export const getStatusLabel = (statusId: number): string => {
  switch (statusId) {
    case ITEM_STATUS.ACTIVE:
      return 'Available';
    case ITEM_STATUS.PENDING:
      return 'Pending';
    case ITEM_STATUS.SOLD:
      return 'Sold';
    case ITEM_STATUS.WITHDRAWN:
      return 'Withdrawn';
    default:
      return 'Unknown';
  }
};

/**
 * Get status color for UI components
 */
export const getStatusColor = (statusId: number): 'success' | 'warning' | 'error' | 'default' => {
  switch (statusId) {
    case ITEM_STATUS.ACTIVE:
      return 'success';
    case ITEM_STATUS.PENDING:
      return 'warning';
    case ITEM_STATUS.SOLD:
      return 'error';
    case ITEM_STATUS.WITHDRAWN:
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Check if item is available for purchase/messaging
 */
export const isItemAvailable = (statusId: number): boolean => {
  return statusId === ITEM_STATUS.ACTIVE;
};

/**
 * Check if item is sold
 */
export const isItemSold = (statusId: number): boolean => {
  return statusId === ITEM_STATUS.SOLD;
};

/**
 * Check if item is withdrawn
 */
export const isItemWithdrawn = (statusId: number): boolean => {
  return statusId === ITEM_STATUS.WITHDRAWN;
};

/**
 * Check if item is pending
 */
export const isItemPending = (statusId: number): boolean => {
  return statusId === ITEM_STATUS.PENDING;
};