import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { rehydrateFromStorageThunk, getMeThunk, selectAuthToken } from '../store/authSlice';
import { rehydrateTokenOnLoad } from '../utils/tokenStorage';

/**
 * Props interface for AppInitializer component
 */
export interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * AppInitializer component following Single Responsibility Principle
 * 
 * Responsibility: Handles application initialization and bootstrap sequence
 * - Rehydrates token from storage utility
 * - Rehydrates authentication state from persistent storage via Redux
 * - Fetches current user if token exists
 * - Manages app startup sequence
 * 
 * Does NOT:
 * - Handle UI rendering beyond children
 * - Manage loading states (delegated to auth slice)
 * - Import services directly (uses DIP via thunk extraArgument)
 * - Perform complex business logic
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);

  useEffect(() => {
    /**
     * Complete app bootstrap sequence following DIP
     * 1. Rehydrate token storage from sessionStorage
     * 2. Rehydrate Redux auth state (validates token)
     * 3. Fetch current user if token exists
     */
    const initializeApp = async () => {
      try {
        // Step 1: Rehydrate token from storage utility
        rehydrateTokenOnLoad();

        // Step 2: Rehydrate auth state via Redux thunk (uses DIP)
        // This will load token from storage and validate it
        const rehydrateResult = await dispatch(rehydrateFromStorageThunk());

        // Step 3: If token exists after rehydration, fetch current user
        // Check both the thunk result and Redux state for token presence
        if (rehydrateFromStorageThunk.fulfilled.match(rehydrateResult) || token) {
          // Fetch current user via thunk (uses DIP for service resolution)
          await dispatch(getMeThunk());
        }
      } catch (error) {
        // Initialization errors are handled by individual thunks
        // No need to handle here - auth slice manages error states
        console.warn('App initialization completed with warnings:', error);
      }
    };

    initializeApp();
  }, [dispatch]); // Don't include token in deps to avoid re-initialization

  // Render children immediately - auth loading state handled by auth slice
  return <>{children}</>;
};

export default AppInitializer;

/*
 * Enhanced AppInitializer Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Only handles app initialization and bootstrap sequence
 *    - No UI logic beyond rendering children
 *    - Clear separation from other concerns
 *    - Delegates loading states to auth slice
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Uses Redux dispatch abstraction
 *    - Depends on auth slice thunks, not direct service imports
 *    - Services resolved via thunk extraArgument (container)
 *    - No direct imports of repositories or HTTP clients
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Open for extension: additional initialization tasks can be added
 *    - Closed for modification: existing bootstrap flow unchanged
 *    - New initialization patterns can be added without breaking existing code
 * 
 * 4. Clean Architecture:
 *    - Infrastructure concern (token rehydration) handled at app boundary
 *    - Children components receive already-initialized state
 *    - No circular dependencies or tight coupling
 *    - Bootstrap sequence follows proper dependency flow
 * 
 * Complete Bootstrap Sequence:
 * 
 * 1. rehydrateTokenOnLoad():
 *    - Loads token from sessionStorage into memory cache
 *    - Framework-agnostic utility function
 *    - No validation, just storage → memory transfer
 * 
 * 2. rehydrateFromStorageThunk():
 *    - Loads token from storage via DI container
 *    - Validates token by attempting to fetch user data
 *    - Auto-clears invalid tokens
 *    - Updates Redux auth state accordingly
 * 
 * 3. getMeThunk() (conditional):
 *    - Only called if token exists after rehydration
 *    - Fetches complete current user profile
 *    - Updates Redux user state
 *    - Uses DI container for service resolution
 * 
 * Error Handling:
 * 
 * - Token utility errors: Handled gracefully (fallback to null token)
 * - Rehydration errors: Handled by rehydrateFromStorageThunk (clears invalid tokens)
 * - GetMe errors: Handled by getMeThunk (updates error state)
 * - Network errors: Graceful degradation, user can retry
 * - No blocking errors: App always renders, auth state reflects current status
 * 
 * Usage:
 * 
 * <AppInitializer>
 *   <App />
 * </AppInitializer>
 * 
 * The component will automatically:
 * - Execute complete bootstrap sequence
 * - Handle all error scenarios gracefully
 * - Ensure proper dependency injection
 * - Maintain separation of concerns
 * - Provide initialized auth state to children
 */