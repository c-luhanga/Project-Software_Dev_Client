/**
 * Profile Redux Slice (SRP, DIP via Thunk Extra)
 * 
 * Single Responsibility: Managing user profile and items state
 * Dependency Inversion: Uses thunk extra argument to resolve IUserService
 * No direct service imports - dependencies injected via Redux configuration
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { UserProfile, ItemSummary, UpdateProfileCommand, IUserService } from '../domain/user/contracts';

/**
 * Profile slice state interface
 */
interface ProfileState {
  profile: UserProfile | null;
  items: ItemSummary[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  error?: string;
  updateError?: string;
  lastUpdatedAt?: number; // Timestamp for UI feedback
}

/**
 * Initial state
 */
const initialState: ProfileState = {
  profile: null,
  items: [],
  status: 'idle',
  updateStatus: 'idle',
  error: undefined,
  updateError: undefined,
  lastUpdatedAt: undefined,
};

/**
 * Thunk extra argument interface for dependency injection
 * Matches the actual container structure from DIContainer
 */
interface ThunkExtra {
  container: {
    userService: IUserService;
  };
}

/**
 * Async thunk to fetch user profile
 * Uses DIP via thunk extra argument to resolve IUserService
 */
export const fetchProfileThunk = createAsyncThunk<
  UserProfile,
  void,
  { extra: ThunkExtra; rejectValue: string }
>(
  'profile/fetchProfile',
  async (_, { extra, rejectWithValue }) => {
    try {
      const userService = extra.container.userService;
      return await userService.getProfile();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk to update user profile (SRP, DIP via thunk extra)
 * 
 * Orchestration Pattern:
 * 1. Resolve IUserService from extra.container (DIP)
 * 2. Call updateProfile service method
 * 3. Dispatch fetchProfileThunk to refresh state
 * 4. Handle pending/fulfilled/rejected with proper state management
 * 5. Store lastUpdatedAt timestamp for UI feedback
 */
export const updateProfileThunk = createAsyncThunk<
  void,
  UpdateProfileCommand,
  { extra: ThunkExtra; rejectValue: string; dispatch: any }
>(
  'profile/updateProfile',
  async (command, { extra, dispatch, rejectWithValue }) => {
    try {
      // Step 1: Resolve IUserService from container (DIP)
      const userService = extra.container.userService;
      
      // Step 2: Call updateProfile service method
      await userService.updateProfile(command);
      
      // Step 3: Dispatch fetchProfileThunk to refresh state
      await dispatch(fetchProfileThunk());
      
      // No return value needed - void thunk with side effect
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk to fetch user's items
 */
export const fetchMyItemsThunk = createAsyncThunk<
  ItemSummary[],
  void,
  { extra: ThunkExtra; rejectValue: string }
>(
  'profile/fetchMyItems',
  async (_, { extra, rejectWithValue }) => {
    try {
      const userService = extra.container.userService;
      return await userService.getMyItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch your items';
      return rejectWithValue(message);
    }
  }
);

/**
 * Profile slice with reducers for all thunk lifecycle states
 */
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    /**
     * Clear profile state (for logout)
     */
    clearProfile: (state) => {
      state.profile = null;
      state.items = [];
      state.status = 'idle';
      state.updateStatus = 'idle';
      state.error = undefined;
      state.updateError = undefined;
      state.lastUpdatedAt = undefined;
    },

    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = undefined;
    },

    /**
     * Clear update error state
     */
    clearUpdateError: (state) => {
      state.updateError = undefined;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile Thunk
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.error = undefined;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch profile';
      })

    // Update Profile Thunk - Enhanced with separate state tracking
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.updateStatus = 'pending';
        state.updateError = undefined;
      })
      .addCase(updateProfileThunk.fulfilled, (state) => {
        state.updateStatus = 'succeeded';
        state.updateError = undefined;
        state.lastUpdatedAt = Date.now(); // Store timestamp for UI feedback
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload || 'Failed to update profile';
      })

    // Fetch My Items Thunk
    builder
      .addCase(fetchMyItemsThunk.pending, (state) => {
        // Keep existing status if profile is loading, otherwise set to loading
        if (state.status !== 'loading') {
          state.status = 'loading';
        }
        state.error = undefined;
      })
      .addCase(fetchMyItemsThunk.fulfilled, (state, action: PayloadAction<ItemSummary[]>) => {
        // Only update status if not loading profile
        if (state.status === 'loading') {
          state.status = 'succeeded';
        }
        state.items = action.payload;
        state.error = undefined;
      })
      .addCase(fetchMyItemsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch your items';
      });
  },
});

/**
 * Action creators
 */
export const { clearProfile, clearError, clearUpdateError } = profileSlice.actions;

/**
 * Selectors following consistent naming pattern
 */
export const selectProfile = (state: RootState): UserProfile | null => state.profile.profile;
export const selectProfileItems = (state: RootState): ItemSummary[] => state.profile.items;
export const selectProfileStatus = (state: RootState): ProfileState['status'] => state.profile.status;
export const selectProfileError = (state: RootState): string | undefined => state.profile.error;

/**
 * Update-specific selectors for UI feedback
 */
export const selectUpdateStatus = (state: RootState): ProfileState['updateStatus'] => state.profile.updateStatus;
export const selectUpdateError = (state: RootState): string | undefined => state.profile.updateError;
export const selectLastUpdatedAt = (state: RootState): number | undefined => state.profile.lastUpdatedAt;

/**
 * Derived selectors for common UI needs
 */
export const selectIsProfileLoading = (state: RootState): boolean => state.profile.status === 'loading';
export const selectHasProfileError = (state: RootState): boolean => !!state.profile.error;
export const selectProfileFullName = (state: RootState): string => {
  const profile = state.profile.profile;
  if (!profile) return '';
  return `${profile.firstName} ${profile.lastName}`.trim();
};
export const selectProfileItemsCount = (state: RootState): number => state.profile.items.length;

/**
 * Update-specific derived selectors for UI feedback
 */
export const selectIsUpdating = (state: RootState): boolean => state.profile.updateStatus === 'pending';
export const selectHasUpdateError = (state: RootState): boolean => !!state.profile.updateError;
export const selectUpdateSucceeded = (state: RootState): boolean => state.profile.updateStatus === 'succeeded';
export const selectTimeSinceLastUpdate = (state: RootState): number | null => {
  const lastUpdated = state.profile.lastUpdatedAt;
  return lastUpdated ? Date.now() - lastUpdated : null;
};

/**
 * Export the reducer
 */
export default profileSlice.reducer;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - ProfileSlice only manages profile and items state
 * - Each thunk has single purpose (fetch, update, fetch items)
 * - Selectors are focused on specific data access patterns
 * 
 * Dependency Inversion Principle (DIP):
 * - No direct imports of services or repositories
 * - Dependencies injected via thunk extra argument
 * - Depends on IUserService abstraction, not concrete implementation
 * 
 * Open/Closed Principle (OCP):
 * - Easy to add new thunks without modifying existing code
 * - Selectors can be extended without changing slice
 * - New profile-related state can be added to interface
 * 
 * Benefits:
 * - Testable: Easy to mock container in tests
 * - Flexible: Can swap service implementations
 * - Maintainable: Clear separation of concerns
 * - Type-safe: Full TypeScript support with proper typing
 */