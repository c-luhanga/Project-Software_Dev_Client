import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { container } from '../core/container';
import type { AdminDashboardData, AdminUsersList, UserSearchOptions } from '../domain/admin/types';

/**
 * Admin Redux Slice - Handles administrative operations state
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for admin operations state management
 * - Handles loading states and error handling for admin actions
 * - Provides thunks for UI components to dispatch admin operations
 * 
 * Dependency Inversion Principle (DIP):
 * - Uses container to get AdminRepository instance
 * - Depends on abstractions, not concrete implementations
 * - Repository handles all API communication details
 */

// State interface
interface AdminState {
  // Dashboard data
  dashboard: {
    data: AdminDashboardData | null;
    isLoading: boolean;
    error: string | null;
    lastFetched: string | null;
  };
  // User management data
  users: {
    data: AdminUsersList | null;
    isLoading: boolean;
    error: string | null;
    currentSearchOptions: UserSearchOptions | null;
    lastFetched: string | null;
  };
  // Operations state
  operations: {
    isLoading: boolean;
    error: string | null;
    lastDeletedItem: { itemId: number } | null;
    lastBannedUser: { userId: number } | null;
    lastUnbannedUser: { userId: number } | null;
  };
}

// Initial state
const initialState: AdminState = {
  dashboard: {
    data: null,
    isLoading: false,
    error: null,
    lastFetched: null,
  },
  users: {
    data: null,
    isLoading: false,
    error: null,
    currentSearchOptions: null,
    lastFetched: null,
  },
  operations: {
    isLoading: false,
    error: null,
    lastDeletedItem: null,
    lastBannedUser: null,
    lastUnbannedUser: null,
  },
};

/**
 * Admin Dashboard Fetch Thunk
 * 
 * Fetches dashboard data through AdminRepository.
 * Handles loading states and error propagation.
 * 
 * @returns Promise resolving to dashboard data
 */
export const fetchAdminDashboardThunk = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const adminRepository = container.adminRepository;
      const dashboardData = await adminRepository.getDashboard();
      return {
        data: dashboardData,
        lastFetched: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      return rejectWithValue(message);
    }
  }
);

/**
 * Admin Users Fetch Thunk
 * 
 * Fetches paginated user list through AdminRepository.
 * Handles loading states and error propagation.
 * 
 * @param options - Search and pagination options
 * @returns Promise resolving to paginated user list
 */
export const fetchAdminUsersThunk = createAsyncThunk(
  'admin/fetchUsers',
  async (options: UserSearchOptions = {}, { rejectWithValue }) => {
    try {
      const adminRepository = container.adminRepository;
      const usersData = await adminRepository.getUsers(options);
      return {
        data: usersData,
        searchOptions: options,
        lastFetched: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

/**
 * Admin Delete Item Thunk
 * 
 * Dispatches item deletion through AdminRepository.
 * Handles loading states and error propagation.
 * 
 * @param itemId - ID of the item to delete
 * @returns Promise resolving to deletion confirmation
 */
export const adminDeleteItemThunk = createAsyncThunk(
  'admin/deleteItem',
  async (itemId: number, { rejectWithValue }) => {
    try {
      const adminRepository = container.adminRepository;
      await adminRepository.deleteItem(itemId);
      return { itemId };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete item';
      return rejectWithValue(message);
    }
  }
);

/**
 * Admin Ban User Thunk
 * 
 * Dispatches user ban through AdminRepository.
 * Handles loading states and error propagation.
 * 
 * @param userId - ID of the user to ban
 * @returns Promise resolving to ban confirmation
 */
export const adminBanUserThunk = createAsyncThunk(
  'admin/banUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const adminRepository = container.adminRepository;
      await adminRepository.banUser(userId);
      return { userId };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to ban user';
      return rejectWithValue(message);
    }
  }
);

/**
 * Admin Unban User Thunk
 * 
 * Dispatches user unban through AdminRepository.
 * Handles loading states and error propagation.
 * 
 * @param userId - ID of the user to unban
 * @returns Promise resolving to unban confirmation
 */
export const adminUnbanUserThunk = createAsyncThunk(
  'admin/unbanUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const adminRepository = container.adminRepository;
      await adminRepository.unbanUser(userId);
      return { userId };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unban user';
      return rejectWithValue(message);
    }
  }
);

/**
 * Admin slice definition
 */
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Clear dashboard error state
    clearDashboardError: (state) => {
      state.dashboard.error = null;
    },
    // Clear users error state
    clearUsersError: (state) => {
      state.users.error = null;
    },
    // Clear operations error state
    clearOperationsError: (state) => {
      state.operations.error = null;
    },
    // Clear last operation results
    clearOperationResults: (state) => {
      state.operations.lastDeletedItem = null;
      state.operations.lastBannedUser = null;
      state.operations.lastUnbannedUser = null;
    },
    // Reset dashboard data (force refresh)
    resetDashboard: (state) => {
      state.dashboard.data = null;
      state.dashboard.lastFetched = null;
      state.dashboard.error = null;
    },
    // Reset users data (force refresh)
    resetUsers: (state) => {
      state.users.data = null;
      state.users.lastFetched = null;
      state.users.error = null;
      state.users.currentSearchOptions = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Admin Dashboard
    builder
      .addCase(fetchAdminDashboardThunk.pending, (state) => {
        state.dashboard.isLoading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchAdminDashboardThunk.fulfilled, (state, action) => {
        state.dashboard.isLoading = false;
        state.dashboard.data = action.payload.data;
        state.dashboard.lastFetched = action.payload.lastFetched;
        state.dashboard.error = null;
      })
      .addCase(fetchAdminDashboardThunk.rejected, (state, action) => {
        state.dashboard.isLoading = false;
        state.dashboard.error = action.payload as string || 'Failed to fetch dashboard data';
      });

    // Fetch Admin Users
    builder
      .addCase(fetchAdminUsersThunk.pending, (state) => {
        state.users.isLoading = true;
        state.users.error = null;
      })
      .addCase(fetchAdminUsersThunk.fulfilled, (state, action) => {
        state.users.isLoading = false;
        state.users.data = action.payload.data;
        state.users.currentSearchOptions = action.payload.searchOptions;
        state.users.lastFetched = action.payload.lastFetched;
        state.users.error = null;
      })
      .addCase(fetchAdminUsersThunk.rejected, (state, action) => {
        state.users.isLoading = false;
        state.users.error = action.payload as string || 'Failed to fetch users';
      });

    // Admin Delete Item
    builder
      .addCase(adminDeleteItemThunk.pending, (state) => {
        state.operations.isLoading = true;
        state.operations.error = null;
      })
      .addCase(adminDeleteItemThunk.fulfilled, (state, action) => {
        state.operations.isLoading = false;
        state.operations.lastDeletedItem = action.payload;
        state.operations.error = null;
      })
      .addCase(adminDeleteItemThunk.rejected, (state, action) => {
        state.operations.isLoading = false;
        state.operations.error = action.payload as string || 'Failed to delete item';
      });

    // Admin Ban User
    builder
      .addCase(adminBanUserThunk.pending, (state) => {
        state.operations.isLoading = true;
        state.operations.error = null;
      })
      .addCase(adminBanUserThunk.fulfilled, (state, action) => {
        state.operations.isLoading = false;
        state.operations.lastBannedUser = action.payload;
        state.operations.error = null;
      })
      .addCase(adminBanUserThunk.rejected, (state, action) => {
        state.operations.isLoading = false;
        state.operations.error = action.payload as string || 'Failed to ban user';
      });

    // Admin Unban User
    builder
      .addCase(adminUnbanUserThunk.pending, (state) => {
        state.operations.isLoading = true;
        state.operations.error = null;
      })
      .addCase(adminUnbanUserThunk.fulfilled, (state, action) => {
        state.operations.isLoading = false;
        state.operations.lastUnbannedUser = action.payload;
        state.operations.error = null;
      })
      .addCase(adminUnbanUserThunk.rejected, (state, action) => {
        state.operations.isLoading = false;
        state.operations.error = action.payload as string || 'Failed to unban user';
      });
  },
});

// Export actions
export const { 
  clearDashboardError,
  clearUsersError,
  clearOperationsError, 
  clearOperationResults, 
  resetDashboard,
  resetUsers
} = adminSlice.actions;

// Dashboard selectors
export const selectDashboardData = (state: { admin: AdminState }) => state.admin.dashboard.data;
export const selectDashboardLoading = (state: { admin: AdminState }) => state.admin.dashboard.isLoading;
export const selectDashboardError = (state: { admin: AdminState }) => state.admin.dashboard.error;
export const selectDashboardLastFetched = (state: { admin: AdminState }) => state.admin.dashboard.lastFetched;

// Users selectors
export const selectUsersData = (state: { admin: AdminState }) => state.admin.users.data;
export const selectUsersLoading = (state: { admin: AdminState }) => state.admin.users.isLoading;
export const selectUsersError = (state: { admin: AdminState }) => state.admin.users.error;
export const selectUsersLastFetched = (state: { admin: AdminState }) => state.admin.users.lastFetched;
export const selectUsersSearchOptions = (state: { admin: AdminState }) => state.admin.users.currentSearchOptions;

// Operations selectors
export const selectOperationsLoading = (state: { admin: AdminState }) => state.admin.operations.isLoading;
export const selectOperationsError = (state: { admin: AdminState }) => state.admin.operations.error;
export const selectLastDeletedItem = (state: { admin: AdminState }) => state.admin.operations.lastDeletedItem;
export const selectLastBannedUser = (state: { admin: AdminState }) => state.admin.operations.lastBannedUser;
export const selectLastUnbannedUser = (state: { admin: AdminState }) => state.admin.operations.lastUnbannedUser;

// Convenience selectors
export const selectAdminIsLoading = (state: { admin: AdminState }) => 
  state.admin.dashboard.isLoading || state.admin.operations.isLoading;

export const selectAdminError = (state: { admin: AdminState }) => 
  state.admin.dashboard.error || state.admin.operations.error;

// Export reducer
export default adminSlice.reducer;