import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { 
  ItemSummary, 
  ItemDetail, 
  PagedResult, 
  CreateItemCommand, 
  AddItemImagesCommand 
} from '../domain/items/contracts';
import type { IItemsService } from '../domain/items/contracts';

/**
 * Items slice state following SRP - single responsibility for items state management
 */
interface ItemsState {
  list: PagedResult<ItemSummary> | null;
  mine: ItemSummary[];
  current: ItemDetail | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
}

/**
 * Initial state
 */
const initialState: ItemsState = {
  list: null,
  mine: [],
  current: null,
  status: 'idle',
};

/**
 * Search items thunk - follows DIP by resolving IItemsService from extra.container
 */
export const searchItemsThunk = createAsyncThunk<
  PagedResult<ItemSummary>,
  { query?: string; categoryId?: number; page?: number; pageSize?: number },
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/searchItems',
  async ({ query, categoryId, page, pageSize }, { extra }) => {
    const itemsService = extra.container.itemsService;
    const result = await itemsService.search(query, categoryId, page, pageSize);
    
    return result;
  }
);

/**
 * Get item by ID thunk
 */
export const getItemThunk = createAsyncThunk<
  ItemDetail,
  number,
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/getItem',
  async (itemId, { extra }) => {
    const itemsService = extra.container.itemsService;
    const result = await itemsService.get(itemId);
    
    return result;
  }
);

/**
 * Create item thunk - returns new item ID
 */
export const createItemThunk = createAsyncThunk<
  number,
  CreateItemCommand,
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/createItem',
  async (command, { extra }) => {
    const itemsService = extra.container.itemsService;
    const result = await itemsService.create(command);
    
    return result;
  }
);

/**
 * Add item images thunk
 */
export const addItemImagesThunk = createAsyncThunk<
  void,
  AddItemImagesCommand,
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/addItemImages',
  async (command, { extra }) => {
    const itemsService = extra.container.itemsService;
    await itemsService.addImages(command);
  }
);

/**
 * Upload item image files thunk (for actual file uploads)
 */
export const uploadItemImagesThunk = createAsyncThunk<
  string[],
  { itemId: number; files: File[] },
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/uploadItemImages',
  async ({ itemId, files }, { extra }) => {
    const itemsService = extra.container.itemsService;
    return await itemsService.uploadImageFiles(itemId, files);
  }
);

/**
 * Mark item as sold thunk
 */
export const markItemSoldThunk = createAsyncThunk<
  void,
  number,
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/markItemSold',
  async (itemId, { extra }) => {
    const itemsService = extra.container.itemsService;
    await itemsService.markSold(itemId);
  }
);

/**
 * List my items thunk
 */
export const listMyItemsThunk = createAsyncThunk<
  ItemSummary[],
  void,
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/listMyItems',
  async (_, { extra }) => {
    const itemsService = extra.container.itemsService;
    const result = await itemsService.listMine();
    
    return result;
  }
);

/**
 * Items slice with reducers that update state accordingly
 */
const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    /**
     * Clear current item
     */
    clearCurrentItem: (state) => {
      state.current = null;
    },
    
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = undefined;
    },
    
    /**
     * Reset items state
     */
    resetItemsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Search items
    builder
      .addCase(searchItemsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(searchItemsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload as any;
      })
      .addCase(searchItemsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Get item
    builder
      .addCase(getItemThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(getItemThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload as any;
      })
      .addCase(getItemThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Create item
    builder
      .addCase(createItemThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(createItemThunk.fulfilled, (state) => {
        state.status = 'succeeded';
        // Note: New item ID is returned but not stored in state
        // UI can handle navigation/refresh as needed
      })
      .addCase(createItemThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Add item images
    builder
      .addCase(addItemImagesThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(addItemImagesThunk.fulfilled, (state) => {
        state.status = 'succeeded';
        // Images added successfully - UI may want to refresh current item
      })
      .addCase(addItemImagesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Upload item images (files)
    builder
      .addCase(uploadItemImagesThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(uploadItemImagesThunk.fulfilled, (state) => {
        state.status = 'succeeded';
        // Files uploaded successfully - UI may want to refresh current item
      })
      .addCase(uploadItemImagesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Mark item sold
    builder
      .addCase(markItemSoldThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(markItemSoldThunk.fulfilled, (state) => {
        state.status = 'succeeded';
        // Item marked as sold - UI may want to refresh lists
      })
      .addCase(markItemSoldThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // List my items
    builder
      .addCase(listMyItemsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(listMyItemsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.mine = action.payload;
      })
      .addCase(listMyItemsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

/**
 * Export actions
 */
export const { clearCurrentItem, clearError, resetItemsState } = itemsSlice.actions;

/**
 * Export selectors for items state
 */
export const selectItemsList = (state: RootState) => state.items.list;
export const selectMyItems = (state: RootState) => state.items.mine;
export const selectCurrentItem = (state: RootState) => state.items.current;
export const selectItemsStatus = (state: RootState) => state.items.status;
export const selectItemsError = (state: RootState) => state.items.error;

/**
 * Compound selectors with memoization
 */
export const selectIsItemsLoading = (state: RootState) => state.items.status === 'loading';
export const selectHasItemsError = (state: RootState) => state.items.status === 'failed';

// Memoized selectors to prevent unnecessary re-renders
export const selectItemsListData = createSelector(
  [selectItemsList],
  (list) => list?.items || []
);

export const selectItemsListMetadata = createSelector(
  [selectItemsList],
  (list) => ({
    totalCount: list?.total || 0,
    pageSize: list?.pageSize || 0,
    currentPage: list?.page || 1,
    totalPages: list?.totalPages || 0,
  })
);

/**
 * Export reducer
 */
export default itemsSlice.reducer;