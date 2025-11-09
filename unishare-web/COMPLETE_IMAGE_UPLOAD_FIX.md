# 🔧 Complete Image Upload Solution

## 🎯 Current Problem

You're trying to add images with blob URLs (`blob:http://localhost:3000/...`) to an endpoint that expects permanent HTTP/HTTPS URLs. Blob URLs are temporary browser objects that won't work on the server.

## ✅ The Complete Fix

We need to use the file upload endpoint we already implemented in the backend instead of trying to send blob URLs.

### Step 1: Add File Upload Method to ItemsRepository

Add this method to `src/infrastructure/items/itemsRepository.ts`:

```typescript
/**
 * Upload image files to an existing item
 * Uses the new file upload endpoint instead of URL-based endpoint
 * 
 * Maps to: POST /api/items/{id}/upload-images
 */
async uploadImageFiles(itemId: number, files: File[]): Promise<string[]> {
  try {
    const formData = new FormData();
    
    // Add each file to FormData with the name expected by the backend
    files.forEach(file => {
      formData.append('files', file);
    });

    console.log('🔄 Uploading files to:', `/items/${itemId}/upload-images`);
    console.log('📁 Files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    const response = await this.apiClient.post<string[]>(
      `/items/${itemId}/upload-images`,
      formData,
      {
        headers: {
          // Don't set Content-Type - let browser set it with boundary for multipart
          // 'Content-Type': 'multipart/form-data' - This is automatically set
        },
      }
    );

    console.log('✅ Upload successful, URLs:', response);
    return response;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    if (error instanceof Error && error.message.includes('403')) {
      throw new Error(`Unauthorized to upload images to item ${itemId}`);
    }
    if (error instanceof Error && error.message.includes('413')) {
      throw new Error('Files too large. Maximum size is 5MB per file');
    }
    if (error instanceof Error && error.message.includes('415')) {
      throw new Error('Unsupported file type. Please use JPEG, PNG, GIF, or WebP images');
    }
    
    throw new Error(
      `Failed to upload images to item ${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```

### Step 2: Update ItemsService Interface

Add this to `src/domain/items/contracts.ts` in the `IItemsService` interface:

```typescript
/**
 * Upload image files to item
 * 
 * @param itemId The item ID
 * @param files Array of File objects to upload
 * @returns Promise resolving to array of uploaded image URLs
 */
uploadImageFiles(itemId: number, files: File[]): Promise<string[]>;
```

### Step 3: Add Method to ItemsService

Add this method to `src/domain/items/itemsService.ts`:

```typescript
/**
 * Upload image files with business logic validation
 * 
 * @param itemId The item ID
 * @param files Array of File objects to upload
 * @returns Promise resolving to array of uploaded image URLs
 */
async uploadImageFiles(itemId: number, files: File[]): Promise<string[]> {
  // Validate item ID
  const validationResult = validateItemId(itemId);
  if (!validationResult.success) {
    throw new BusinessRuleError(
      validationResult.message || 'Item ID validation failed',
      'VALIDATION_ERROR',
      'itemId'
    );
  }

  // Validate files
  if (!files || files.length === 0) {
    throw new BusinessRuleError('At least one file is required', 'VALIDATION_ERROR', 'files');
  }

  if (files.length > 4) {
    throw new BusinessRuleError('Maximum 4 files allowed', 'VALIDATION_ERROR', 'files');
  }

  // Validate file types and sizes (client-side validation)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new BusinessRuleError(
        `File "${file.name}" has unsupported type. Allowed: JPEG, PNG, GIF, WebP, BMP`,
        'VALIDATION_ERROR',
        'files'
      );
    }

    if (file.size > maxSize) {
      throw new BusinessRuleError(
        `File "${file.name}" is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size: 5MB`,
        'VALIDATION_ERROR',
        'files'
      );
    }
  }

  console.log('🔍 Uploading files:', {
    itemId,
    fileCount: files.length,
    files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
  });

  try {
    return await this.repository.uploadImageFiles(itemId, files);
  } catch (error) {
    throw new BusinessRuleError(
      `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UPLOAD_ERROR'
    );
  }
}
```

### Step 4: Add Redux Thunk

Add this thunk to `src/store/itemsSlice.ts`:

```typescript
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
```

And add the reducer cases:

```typescript
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
```

### Step 5: Update AddImagesDialog Props

Change the interface in `src/presentation/components/items/AddImagesDialog.tsx`:

```typescript
interface AddImagesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (files: File[]) => void; // Changed from string[] to File[]
  maxCount?: number;
}
```

And update the confirm handler:

```typescript
/**
 * Handle confirm - send files to parent for upload
 */
const handleConfirm = () => {
  // Pass actual files for upload, not preview URLs
  console.log('📤 Confirming files:', selectedFiles.map(f => ({ name: f.name, size: f.size })));
  onConfirm(selectedFiles); // Pass files instead of URLs
  
  // Reset state after confirmation
  setSelectedFiles([]);
  setPreviewUrls([]);
};
```

### Step 6: Update ItemDetailPage

Update the handler in `src/presentation/pages/items/ItemDetailPage.tsx`:

```typescript
/**
 * Handle confirming image upload
 */
const handleConfirmImages = async (files: File[]) => { // Changed parameter type
  if (!currentItem || files.length === 0) {
    setShowAddImagesDialog(false);
    return;
  }

  try {
    // Clear any previous errors before starting
    dispatch(clearError());
    
    console.log('🔍 Starting file upload with:', {
      itemId: currentItem.itemId,
      fileCount: files.length,
      fileNames: files.map(f => f.name)
    });

    const result = await dispatch(uploadItemImagesThunk({ // Use new thunk
      itemId: currentItem.itemId,
      files
    }));

    if (uploadItemImagesThunk.fulfilled.match(result)) {
      showFeedback('Images uploaded successfully!');
      
      // Refresh the item to show updated images
      dispatch(getItemThunk(currentItem.itemId));
    } else if (uploadItemImagesThunk.rejected.match(result)) {
      const errorMsg = result.error.message || 'Failed to upload images';
      console.error('❌ Upload failed:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
    console.error('❌ Upload error:', errorMessage);
    showFeedback(errorMessage, 'error');
  } finally {
    setShowAddImagesDialog(false);
  }
};
```

## 🧪 Testing Steps

1. Make these changes
2. Start your backend API
3. Go to an item detail page
4. Click "Add Images"
5. Select image files from your computer
6. Click confirm
7. The files should upload to your backend and the URLs should be stored in the database

This uses the proper file upload flow we implemented earlier!