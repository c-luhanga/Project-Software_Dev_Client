import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { rehydrateFromStorageThunk } from '../store/authSlice';

/**
 * Props interface for AppInitializer component
 */
export interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * AppInitializer component following Single Responsibility Principle
 * 
 * Responsibility: Handles application initialization tasks
 * - Rehydrates authentication state from persistent storage
 * - Manages app startup sequence
 * 
 * Does NOT:
 * - Handle UI rendering beyond children
 * - Manage loading states (delegated to auth slice)
 * - Perform business logic
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Rehydrate authentication state from storage on app start
    // This will:
    // 1. Load token from sessionStorage
    // 2. Validate token by fetching user data
    // 3. Auto-clear invalid tokens
    // 4. Update auth state accordingly
    dispatch(rehydrateFromStorageThunk());
  }, [dispatch]);

  // Render children immediately - auth loading state handled by auth slice
  return <>{children}</>;
};

export default AppInitializer;

/*
 * AppInitializer Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Only handles app initialization tasks
 *    - No UI logic beyond rendering children
 *    - Clear separation from other concerns
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Uses Redux dispatch abstraction
 *    - Depends on auth slice thunks, not direct storage access
 *    - No direct imports of services or repositories
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Open for extension: additional initialization tasks can be added
 *    - Closed for modification: existing initialization flow unchanged
 *    - New initialization patterns can be added without breaking existing code
 * 
 * 4. Clean Architecture:
 *    - Infrastructure concern (token rehydration) handled at app boundary
 *    - Children components receive already-initialized state
 *    - No circular dependencies or tight coupling
 * 
 * Usage:
 * 
 * <AppInitializer>
 *   <App />
 * </AppInitializer>
 * 
 * The component will automatically:
 * - Load persisted authentication state
 * - Validate tokens
 * - Update Redux store
 * - Handle initialization errors gracefully
 */