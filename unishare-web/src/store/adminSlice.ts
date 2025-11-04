import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { container } from '../core/container';

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
  isLoading: boolean;
  error: string | null;
  lastDeletedItem: { itemId: number } | null;
  lastBannedUser: { userId: number } | null;
}

// Initial state
const initialState: AdminState = {
  isLoading: false,
  error: null,
  lastDeletedItem: null,
  lastBannedUser: null,
};

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
 * Admin slice definition
 */
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Clear error state
    clearAdminError: (state) => {
      state.error = null;
    },
    // Clear last operation results
    clearAdminResults: (state) => {
      state.lastDeletedItem = null;
      state.lastBannedUser = null;
    },
  },
  extraReducers: (builder) => {
    // Admin Delete Item
    builder
      .addCase(adminDeleteItemThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminDeleteItemThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastDeletedItem = action.payload;
        state.error = null;
      })
      .addCase(adminDeleteItemThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to delete item';
      });

    // Admin Ban User
    builder
      .addCase(adminBanUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminBanUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastBannedUser = action.payload;
        state.error = null;
      })
      .addCase(adminBanUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to ban user';
      });
  },
});

// Export actions
export const { clearAdminError, clearAdminResults } = adminSlice.actions;

// Export selectors
export const selectAdminIsLoading = (state: { admin: AdminState }) => state.admin.isLoading;
export const selectAdminError = (state: { admin: AdminState }) => state.admin.error;
export const selectLastDeletedItem = (state: { admin: AdminState }) => state.admin.lastDeletedItem;
export const selectLastBannedUser = (state: { admin: AdminState }) => state.admin.lastBannedUser;

// Export reducer
export default adminSlice.reducer;