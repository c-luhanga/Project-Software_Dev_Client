/**
 * Admin Domain Types
 * 
 * Defines TypeScript types for admin dashboard data and related structures.
 * These types mirror the backend AdminDashboardDto to ensure type safety
 * across the frontend-backend boundary.
 */

/**
 * Admin Dashboard Data - matches AdminDashboardDto from backend
 * 
 * Contains all platform statistics and metrics needed for the admin dashboard
 */
export interface AdminDashboardData {
  /** Total number of registered users */
  totalUsers: number;

  /** Number of currently banned users */
  bannedUsers: number;

  /** Number of admin users */
  adminUsers: number;

  /** Total number of items in the marketplace */
  totalItems: number;

  /** Number of active items available for purchase */
  activeItems: number;

  /** Number of items with pending purchase requests */
  pendingItems: number;

  /** Number of sold items */
  soldItems: number;

  /** Number of withdrawn items */
  withdrawnItems: number;

  /** Timestamp when the dashboard data was generated */
  lastUpdated: string; // ISO date string

  /** Platform health status message */
  status: string;
}

/**
 * Dashboard Statistics for easier component consumption
 */
export interface DashboardStats {
  users: {
    total: number;
    banned: number;
    admins: number;
    active: number; // calculated: total - banned
  };
  items: {
    total: number;
    active: number;
    pending: number;
    sold: number;
    withdrawn: number;
  };
  platform: {
    status: string;
    lastUpdated: Date;
  };
}

/**
 * User management data for admin operations
 */
export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isBanned: boolean;
  registrationDate: string; // ISO date string
  lastLoginDate?: string; // ISO date string
}

/**
 * Paginated user list for admin interface
 */
export interface AdminUsersList {
  users: AdminUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Item management data for admin operations
 */
export interface AdminItem {
  id: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  status: 'active' | 'pending' | 'sold' | 'withdrawn';
  sellerId: number;
  sellerName: string;
  sellerEmail: string;
  createdDate: string; // ISO date string
  images: string[];
}

/**
 * Paginated item list for admin interface
 */
export interface AdminItemsList {
  items: AdminItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Search/filter options for user management
 */
export interface UserSearchOptions {
  searchTerm?: string;
  includeAdmins?: boolean;
  includeBanned?: boolean;
  sortBy?: 'email' | 'firstName' | 'lastName' | 'registrationDate' | 'lastLoginDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Search/filter options for item management
 */
export interface ItemSearchOptions {
  searchTerm?: string;
  categoryId?: number;
  status?: 'active' | 'pending' | 'sold' | 'withdrawn';
  sellerId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'title' | 'price' | 'createdDate' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Admin operation response types
 */
export interface AdminOperationResponse {
  success: boolean;
  message: string;
  timestamp: string; // ISO date string
}

export interface AdminDeleteItemResponse extends AdminOperationResponse {
  itemId: number;
}

export interface AdminBanUserResponse extends AdminOperationResponse {
  userId: number;
}

export interface AdminUnbanUserResponse extends AdminOperationResponse {
  userId: number;
}

/**
 * Utility type for transforming backend data to frontend data
 */
export type AdminDashboardTransform = {
  toDashboardStats(data: AdminDashboardData): DashboardStats;
  toAdminUser(backendUser: any): AdminUser;
  toAdminItem(backendItem: any): AdminItem;
};

/**
 * Admin quick action types for dashboard buttons
 */
export interface AdminQuickAction {
  id: string;
  title: string;
  description: string;
  icon: string; // Material-UI icon name
  action: () => void;
  requiresConfirmation?: boolean;
  disabled?: boolean;
}

/**
 * Recent activity item for admin dashboard
 */
export interface AdminActivity {
  id: string;
  type: 'user_registration' | 'item_created' | 'item_sold' | 'user_banned' | 'admin_action';
  description: string;
  timestamp: string; // ISO date string
  userId?: number;
  itemId?: number;
  adminId?: number;
  severity: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Platform health metrics
 */
export interface PlatformHealth {
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  message: string;
  lastChecked: string; // ISO date string
  metrics: {
    uptime: number; // percentage
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    activeConnections: number;
  };
}