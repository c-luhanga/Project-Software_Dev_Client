import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { 
  ItemSummary, 
  ItemDetail, 
  PagedResult, 
  CreateItemCommand, 
  AddItemImagesCommand,
  UpdateItemCommand
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
  async (command, { extra, rejectWithValue }) => {
    try {
      console.log('🔍 Redux createItemThunk - Starting item creation:', command);
      
      const itemsService = extra.container.itemsService;
      const result = await itemsService.create(command);
      
      console.log('✅ Redux createItemThunk - Item created successfully:', result);
      
      if (typeof result !== 'number' || result <= 0) {
        console.error('❌ Redux createItemThunk - Invalid item ID returned:', result);
        return rejectWithValue('Invalid item ID returned from server');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Redux createItemThunk - Error creating item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      return rejectWithValue(errorMessage);
    }
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
 * Update item status thunk
 */
export const updateItemStatusThunk = createAsyncThunk<
  void,
  { itemId: number; statusId: number },
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/updateItemStatus',
  async ({ itemId, statusId }, { extra }) => {
    const itemsService = extra.container.itemsService;
    await itemsService.updateStatus(itemId, statusId);
  }
);

/**
 * Update item thunk
 */
export const updateItemThunk = createAsyncThunk<
  ItemDetail,
  { itemId: number; command: UpdateItemCommand },
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/updateItem',
  async ({ itemId, command }, { extra }) => {
    const itemsService = extra.container.itemsService;
    const result = await itemsService.update(itemId, command);
    
    return result;
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
      .addCase(uploadItemImagesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Update current item with new image URLs
        if (state.current) {
          // Add the new image URLs to the current item's images
          const newImageUrls = action.payload;
          // Create a new array with existing images plus new ones
          const updatedImages = [...(state.current.images || []), ...newImageUrls];
          // Use Immer's Draft type to update the readonly property
          (state.current as any).images = updatedImages;
          
          console.log('🖼️ Updated item images:', updatedImages);
        }
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

    // Update item status
    builder
      .addCase(updateItemStatusThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(updateItemStatusThunk.fulfilled, (state) => {
        state.status = 'succeeded';
        // Item status updated - UI may want to refresh lists
      })
      .addCase(updateItemStatusThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Update item
    builder
      .addCase(updateItemThunk.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(updateItemThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the current item with the updated data
        state.current = action.payload as any;
        
        // Also update the item in the list if it exists
        if (state.list && state.list.items) {
          const updatedItem = action.payload;
          const itemIndex = state.list.items.findIndex(item => item.itemId === updatedItem.itemId);
          if (itemIndex !== -1) {
            // Update the item summary with available fields
            (state.list.items as any)[itemIndex] = {
              ...state.list.items[itemIndex],
              title: updatedItem.title,
              price: updatedItem.price,
              // Keep existing fields that might not be in ItemDetail
            };
          }
        }
        
        // Update in mine list if present
        if (state.mine.length > 0) {
          const updatedItem = action.payload;
          const mineIndex = state.mine.findIndex(item => item.itemId === updatedItem.itemId);
          if (mineIndex !== -1) {
            (state.mine as any)[mineIndex] = {
              ...state.mine[mineIndex],
              title: updatedItem.title,
              price: updatedItem.price,
            };
          }
        }
      })
      .addCase(updateItemThunk.rejected, (state, action) => {
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