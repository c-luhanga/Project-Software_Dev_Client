# 🔧 **SOLUTION: Image Upload Fix**

## 🎯 **Root Cause Found**

The issue is a mismatch between:
- **Backend**: Expects actual file uploads via FormData to `/api/items/{id}/upload-images`
- **Frontend**: Trying to send blob URLs to the URL-based image endpoint

## 🛠️ **The Fix**

The frontend `AddImagesDialog` is creating blob URLs (like `blob:http://localhost:3000/abc123`) but the validation expects real HTTP URLs. We need to update the frontend to use the new file upload endpoint.

## 📋 **Required Changes**

### 1. Update ItemsRepository to Add File Upload Method

Add this method to `src/infrastructure/items/itemsRepository.ts`:

```typescript
/**
 * Upload image files to an existing item
 * 
 * Maps to: POST /api/items/{id}/upload-images
 * 
 * @param itemId The item ID
 * @param files Array of File objects to upload
 * @returns Promise resolving to array of uploaded image URLs
 */
async uploadImages(itemId: number, files: File[]): Promise<string[]> {
  try {
    const formData = new FormData();
    
    // Add each file to FormData
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await this.apiClient.post<string[]>(
      `/items/${itemId}/upload-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    if (error instanceof Error && error.message.includes('403')) {
      throw new Error(`Unauthorized to upload images to item ${itemId}`);
    }
    throw new Error(
      `Failed to upload images to item ${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```

### 2. Update ItemsService to Add File Upload Method

Add this method to `src/domain/items/itemsService.ts`:

```typescript
/**
 * Upload image files with business logic validation
 * 
 * @param itemId The item ID
 * @param files Array of File objects to upload
 * @returns Promise resolving to array of uploaded image URLs
 */
async uploadImages(itemId: number, files: File[]): Promise<string[]> {
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

  // Validate file types and sizes
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new BusinessRuleError(
        `File ${file.name} has unsupported type. Allowed: JPEG, PNG, GIF, WebP`,
        'VALIDATION_ERROR',
        'files'
      );
    }

    if (file.size > maxSize) {
      throw new BusinessRuleError(
        `File ${file.name} is too large. Maximum size: 5MB`,
        'VALIDATION_ERROR',
        'files'
      );
    }
  }

  try {
    return await this.repository.uploadImages(itemId, files);
  } catch (error) {
    throw new BusinessRuleError(
      `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UPLOAD_ERROR'
    );
  }
}
```

### 3. Update ItemsService Interface

Add this to `src/domain/items/contracts.ts`:

```typescript
/**
 * Upload image files to item
 * 
 * @param itemId The item ID
 * @param files Array of File objects to upload
 * @returns Promise resolving to array of uploaded image URLs
 */
uploadImages(itemId: number, files: File[]): Promise<string[]>;
```

### 4. Update Redux Store

Add this thunk to `src/store/itemsSlice.ts`:

```typescript
/**
 * Upload item images thunk (for files)
 */
export const uploadItemImagesThunk = createAsyncThunk<
  string[],
  { itemId: number; files: File[] },
  { extra: { container: { itemsService: IItemsService } } }
>(
  'items/uploadItemImages',
  async ({ itemId, files }, { extra }) => {
    const itemsService = extra.container.itemsService;
    return await itemsService.uploadImages(itemId, files);
  }
);
```

### 5. Update AddImagesDialog

Change the confirm handler to pass files instead of URLs:

```typescript
/**
 * Handle confirm - send files to parent for upload
 */
const handleConfirm = () => {
  // Pass actual files for upload, not preview URLs
  onConfirm(selectedFiles); // Change this line
  
  // Reset state after confirmation
  setSelectedFiles([]);
  setPreviewUrls([]);
};
```

And update the prop type:

```typescript
interface AddImagesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (files: File[]) => void; // Changed from string[] to File[]
  maxCount?: number;
}
```

### 6. Update ItemDetailPage

Update the confirm handler:

```typescript
const handleConfirmImages = async (files: File[]) => { // Changed parameter type
  if (!currentItem || files.length === 0) {
    setShowAddImagesDialog(false);
    return;
  }

  try {
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

## 🚀 **Quick Test Fix**

As a temporary fix to test if this solves the validation issue, you can add this to the validation function to accept blob URLs:

In `src/domain/items/validators.ts`, update the `BeAValidUrl` function:

```typescript
private static isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Accept HTTP, HTTPS, and blob URLs for now
    return ['http:', 'https:', 'blob:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}
```

This will allow blob URLs to pass validation temporarily while you implement the proper file upload flow.