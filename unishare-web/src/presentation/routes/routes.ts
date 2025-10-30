/**
 * Navigation Routes Configuration
 * 
 * Centralized route definitions following DRY principles
 * Provides type-safe navigation paths for the application
 */

/**
 * Application route paths
 * Centralized definition prevents typos and enables refactoring
 */
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Protected routes
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  ITEMS: '/items',
  MESSAGES: '/messages',
} as const;

/**
 * Route metadata for navigation components
 */
export interface RouteMetadata {
  path: string;
  title: string;
  description?: string;
  requiresAuth: boolean;
  icon?: string;
}

/**
 * Route definitions with metadata
 */
export const ROUTE_METADATA: Record<keyof typeof ROUTES, RouteMetadata> = {
  HOME: {
    path: ROUTES.HOME,
    title: 'Home',
    description: 'University marketplace home',
    requiresAuth: false,
    icon: 'home'
  },
  LOGIN: {
    path: ROUTES.LOGIN,
    title: 'Sign In',
    description: 'Sign in to your account',
    requiresAuth: false,
    icon: 'login'
  },
  REGISTER: {
    path: ROUTES.REGISTER,
    title: 'Sign Up',
    description: 'Create a new account',
    requiresAuth: false,
    icon: 'user-plus'
  },
  PROFILE: {
    path: ROUTES.PROFILE,
    title: 'Profile',
    description: 'Manage your profile and listings',
    requiresAuth: true,
    icon: 'user'
  },
  DASHBOARD: {
    path: ROUTES.DASHBOARD,
    title: 'Dashboard',
    description: 'Overview of your activity',
    requiresAuth: true,
    icon: 'dashboard'
  },
  ITEMS: {
    path: ROUTES.ITEMS,
    title: 'Items',
    description: 'Browse and manage items',
    requiresAuth: true,
    icon: 'package'
  },
  MESSAGES: {
    path: ROUTES.MESSAGES,
    title: 'Messages',
    description: 'View your conversations',
    requiresAuth: true,
    icon: 'message-circle'
  }
};

/**
 * Helper function to get protected routes
 */
export const getProtectedRoutes = (): RouteMetadata[] => {
  return Object.values(ROUTE_METADATA).filter(route => route.requiresAuth);
};

/**
 * Helper function to get public routes
 */
export const getPublicRoutes = (): RouteMetadata[] => {
  return Object.values(ROUTE_METADATA).filter(route => !route.requiresAuth);
};

/**
 * Type-safe navigation helper
 */
export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

/*
 * Usage Examples:
 * 
 * // Type-safe navigation
 * navigate(ROUTES.PROFILE);
 * 
 * // Route metadata access
 * const profileMeta = ROUTE_METADATA.PROFILE;
 * 
 * // Generate navigation menu
 * const protectedRoutes = getProtectedRoutes();
 * const navItems = protectedRoutes.map(route => ({
 *   label: route.title,
 *   href: route.path,
 *   icon: route.icon
 * }));
 * 
 * // Route validation
 * const isValidRoute = (path: string): path is AppRoute => {
 *   return Object.values(ROUTES).includes(path as AppRoute);
 * };
 */