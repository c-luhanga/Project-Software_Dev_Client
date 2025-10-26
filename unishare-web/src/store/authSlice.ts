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
 * Logout thunk - clears authentication state
 */
export const logoutThunk = createAsyncThunk<
  void,
  void,
  AsyncThunkConfig
>(
  'auth/logout',
  async (_, { extra: { container } }) => {
    try {
      const authService = container.authService;
      await authService.logout();
      
      // Token is automatically cleared in AxiosApiClient through the service
    } catch (error: any) {
      // Even if server logout fails, we'll clear local state
      console.warn('Logout warning:', error?.message);
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

    // Logout thunk reducers
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.status = 'idle';
        state.error = undefined;
      });
  },
});

// Export actions
export const { 
  clearError, 
  resetAuthState, 
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