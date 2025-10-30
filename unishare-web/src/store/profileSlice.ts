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
  error?: string;
}

/**
 * Initial state
 */
const initialState: ProfileState = {
  profile: null,
  items: [],
  status: 'idle',
  error: undefined,
};

/**
 * Thunk extra argument interface for dependency injection
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
 * Async thunk to update user profile
 * Updates profile then fetches fresh data
 */
export const updateProfileThunk = createAsyncThunk<
  UserProfile,
  UpdateProfileCommand,
  { extra: ThunkExtra; rejectValue: string }
>(
  'profile/updateProfile',
  async (command, { extra, rejectWithValue }) => {
    try {
      const userService = extra.container.userService;
      
      // Update profile
      await userService.updateProfile(command);
      
      // Fetch fresh profile data
      return await userService.getProfile();
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
      state.error = undefined;
    },

    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = undefined;
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

    // Update Profile Thunk
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.status = 'succeeded';
        state.profile = action.payload; // Fresh profile data after update
        state.error = undefined;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update profile';
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
export const { clearProfile, clearError } = profileSlice.actions;

/**
 * Selectors following consistent naming pattern
 */
export const selectProfile = (state: RootState): UserProfile | null => state.profile.profile;
export const selectProfileItems = (state: RootState): ItemSummary[] => state.profile.items;
export const selectProfileStatus = (state: RootState): ProfileState['status'] => state.profile.status;
export const selectProfileError = (state: RootState): string | undefined => state.profile.error;

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