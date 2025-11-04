import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LoginRequest, RegisterRequest, LoginResponse, User } from '../types/auth';
import type { AsyncThunkConfig } from './store';
import { mapError } from '../utils/errorMapper';

/**
 * Auth state interface following Single Responsibility Principle
 * Only contains authentication-related state
 */
export interface AuthState {
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  token: null,
  user: null,
  status: 'idle',
  error: undefined,
};

/**
 * Auth thunks using Dependency Inversion Principle
 * Services are resolved from thunkAPI.extra.container
 */

/**
 * Rehydrate authentication state from persistent storage
 * Loads token from storage and validates it by fetching user data
 */
export const rehydrateFromStorageThunk = createAsyncThunk<
  { token: string; user: User },
  void,
  AsyncThunkConfig
>(
  'auth/rehydrateFromStorage',
  async (_, { extra: { container }, rejectWithValue }) => {
    try {
      // Get token from storage via DI container
      const tokenManager = container.tokenManager;
      const token = tokenManager.getToken();
      
      if (!token) {
        return rejectWithValue('No token found in storage');
      }

      // Validate token by fetching user data
      const authService = container.authService;
      const user = await authService.getCurrentUser();
      
      return { token, user };
    } catch (error: any) {
      // Clear invalid token from storage
      const tokenManager = container.tokenManager;
      tokenManager.clearToken();
      
      const mappedError = mapError(error);
      return rejectWithValue(mappedError.message);
    }
  }
);

/**
 * Login thunk - authenticates user and updates token
 */
export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  AsyncThunkConfig
>(
  'auth/login',
  async (credentials, { extra: { container }, rejectWithValue }) => {
    try {
      const authService = container.authService;
      const response = await authService.login(credentials);
      
      // Token is automatically set in AxiosApiClient through the service
      return response;
    } catch (error: any) {
      const mappedError = mapError(error);
      return rejectWithValue(mappedError.message);
    }
  }
);

/**
 * Register thunk - creates new user account and auto-login
 */
export const registerThunk = createAsyncThunk<
  LoginResponse,
  RegisterRequest,
  AsyncThunkConfig
>(
  'auth/register',
  async (userData, { extra: { container }, rejectWithValue }) => {
    try {
      const authService = container.authService;
      const response = await authService.register(userData);
      
      // Token is automatically set in AxiosApiClient through the service
      return response;
    } catch (error: any) {
      const mappedError = mapError(error);
      return rejectWithValue(mappedError.message);
    }
  }
);

/**
 * Get current user thunk - fetches authenticated user data
 */
export const getMeThunk = createAsyncThunk<
  User,
  void,
  AsyncThunkConfig
>(
  'auth/getMe',
  async (_, { extra: { container }, rejectWithValue }) => {
    try {
      const authService = container.authService;
      return await authService.getCurrentUser();
    } catch (error: any) {
      const mappedError = mapError(error);
      return rejectWithValue(mappedError.message);
    }
  }
);

/**
 * Refresh token thunk - refreshes authentication token
 */
export const refreshTokenThunk = createAsyncThunk<
  LoginResponse,
  void,
  AsyncThunkConfig
>(
  'auth/refreshToken',
  async (_, { extra: { container }, rejectWithValue }) => {
    try {
      const authService = container.authService;
      const response = await authService.refreshToken();
      
      // Token is automatically updated in AxiosApiClient through the service
      return response;
    } catch (error: any) {
      const mappedError = mapError(error);
      return rejectWithValue(mappedError.message);
    }
  }
);

/**
 * Logout thunk - clears authentication state and tokens
 * Handles side effects: calls server logout, clears tokens, updates HTTP client
 */
export const logoutThunk = createAsyncThunk<
  void,
  void,
  AsyncThunkConfig
>(
  'auth/logout',
  async (_, { extra: { container }, dispatch }) => {
    try {
      // Attempt server-side logout (optional - may fail)
      const authService = container.authService;
      await authService.logout();
    } catch (error: any) {
      // Even if server logout fails, we'll continue with local cleanup
      console.warn('Server logout warning:', error?.message);
    } finally {
      // Always clear local tokens and HTTP client auth
      const tokenManager = container.tokenManager;
      tokenManager.clearToken();
      
      // Ensure HTTP client auth header is cleared via DI
      const apiClient = container.apiClient;
      if ('setAuthToken' in apiClient) {
        (apiClient as any).setAuthToken(null);
      } else {
        apiClient.setToken(null);
      }

      // Dispatch pure logout action to clear state
      dispatch(authSlice.actions.logout());
    }
  }
);

/**
 * Auth slice following Single Responsibility and Open/Closed Principles
 * Reducers are slim and focused on state updates only
 * Open for extension through additional thunks without modifying existing reducers
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clear auth error - allows UI to reset error state
     */
    clearError: (state) => {
      state.error = undefined;
    },

    /**
     * Reset auth state - useful for testing or manual state reset
     */
    resetAuthState: (state) => {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = undefined;
    },

    /**
     * Pure logout reducer - clears authentication state
     * Side effects (token clearing, HTTP client updates) handled in logoutThunk
     * Keeps reducer pure following SRP
     */
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = undefined;
    },

    /**
     * Update user profile - for profile updates without full re-auth
     * Supports OCP by allowing profile updates without changing auth flow
     */
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    /**
     * Set loading state manually - for custom loading scenarios
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.status = action.payload ? 'loading' : 'idle';
    },
  },
  extraReducers: (builder) => {
    // Rehydrate from storage thunk reducers
    builder
      .addCase(rehydrateFromStorageThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(rehydrateFromStorageThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = undefined;
      })
      .addCase(rehydrateFromStorageThunk.rejected, (state, action) => {
        state.status = 'idle';
        state.token = null;
        state.user = null;
        state.error = action.payload;
      });

    // Login thunk reducers
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = {
          userId: action.payload.userId,
          firstName: action.payload.name.split(' ')[0] || '',
          lastName: action.payload.name.split(' ').slice(1).join(' ') || '',
          email: action.payload.email,
          isAdmin: false, // Will be updated by getMeThunk
        } as User;
        state.error = undefined;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.token = null;
        state.user = null;
        state.error = action.payload;
      });

    // Register thunk reducers
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.status = 'succeeded';
        // Registration only returns { userId }, doesn't auto-login
        // User needs to login separately to get token and profile
        state.error = undefined;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.token = null;
        state.user = null;
        state.error = action.payload;
      });

    // Get me thunk reducers
    builder
      .addCase(getMeThunk.pending, (state) => {
        // Don't set loading for getMe unless there's no user data
        if (!state.user) {
          state.status = 'loading';
        }
      })
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = undefined;
      })
      .addCase(getMeThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        // Clear user data if getMe fails (token might be invalid)
        if (action.payload?.includes('401') || action.payload?.includes('Unauthorized')) {
          state.token = null;
          state.user = null;
        }
      });

    // Refresh token thunk reducers
    builder
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.error = undefined;
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.token = null;
        state.user = null;
        state.error = action.payload;
      });

    // Note: Logout thunk uses pure logout action instead of extraReducer
    // This maintains SRP: side effects in thunk, pure state updates in reducer
  },
});

// Export actions
export const { 
  clearError, 
  resetAuthState, 
  logout,
  updateUserProfile, 
  setLoading 
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

/**
 * Selectors following Single Responsibility Principle
 * Each selector has a single purpose
 */
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  Boolean(state.auth.token && state.auth.user);
export const selectIsLoading = (state: { auth: AuthState }) => 
  state.auth.status === 'loading';
export const selectIsAdmin = (state: { auth: AuthState }) => 
  Boolean(state.auth.user?.isAdmin);
export const selectUserId = (state: { auth: AuthState }) => 
  state.auth.user?.userId;

/*
 * Enhanced Auth Slice Architecture (SRP + OCP + DIP):
 * 
 * Single Responsibility Principle (SRP):
 * - Pure reducers only handle state updates
 * - Thunks handle all side effects (API calls, storage, HTTP client)
 * - Clear separation between state management and external operations
 * 
 * Open/Closed Principle (OCP):
 * - Slice is open for extension via new thunks and actions
 * - Closed for modification - existing reducers remain unchanged
 * - New authentication flows can be added without breaking existing code
 * 
 * Dependency Inversion Principle (DIP):
 * - Thunks depend on container abstractions, not concrete implementations
 * - Token storage accessed via tokenManager interface
 * - HTTP client accessed via apiClient interface
 * - Services accessed via dependency injection container
 * 
 * Key Enhancements:
 * 
 * 1. rehydrateFromStorageThunk():
 *    - Loads token from storage at app startup
 *    - Validates token by fetching user data
 *    - Auto-clears invalid tokens
 *    - Handles storage unavailability gracefully
 * 
 * 2. Enhanced logoutThunk():
 *    - Handles server logout (with graceful failure)
 *    - Clears token storage via DI container
 *    - Updates HTTP client auth headers
 *    - Dispatches pure logout action for state cleanup
 *    - Maintains clear separation of concerns
 * 
 * 3. Pure logout() reducer:
 *    - Only handles state clearing
 *    - No side effects (maintained in thunk)
 *    - Can be called independently for testing
 *    - Follows functional programming principles
 * 
 * Usage Patterns:
 * 
 * // App initialization
 * dispatch(rehydrateFromStorageThunk());
 * 
 * // User logout
 * dispatch(logoutThunk());
 * 
 * // Manual state clearing (testing)
 * dispatch(logout());
 * 
 * // Error handling
 * dispatch(clearError());
 */