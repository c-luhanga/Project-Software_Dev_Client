/**
 * Routes module exports
 * Provides clean interface for routing-related components and utilities
 */
export { AppRouter } from './AppRouter';
export { ProtectedRoute } from './ProtectedRoute';
export { ROUTES, ROUTE_METADATA, getProtectedRoutes, getPublicRoutes } from './routes';
export type { AppRoute, RouteMetadata } from './routes';

// Default export for convenience
export { AppRouter as default } from './AppRouter';