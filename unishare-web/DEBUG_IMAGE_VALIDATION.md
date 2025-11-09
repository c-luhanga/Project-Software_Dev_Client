# Image Validation Debug Guide

## 🐛 **Current Issue: "Failed to load item: Image validation failed"**

This error is happening because the image validation in the frontend is failing when trying to add images to an item. Here's how to debug and fix it:

## 🔍 **Root Cause Analysis**

The error originates from `src/domain/items/itemsService.ts` in the `addImages` method:

```typescript
const validationResult = validateAddImages(command);
if (!validationResult.success) {
  throw new BusinessRuleError(
    validationResult.message || 'Image validation failed',
    'VALIDATION_ERROR',
    firstError?.[0]
  );
}
```

## 🛠️ **Debug Steps**

### Step 1: Check What's Being Validated

The `validateAddImages` function expects this structure:
```typescript
{
  itemId: number,      // Must be positive integer
  imageUrls: string[]  // Array of 1-4 valid HTTP/HTTPS URLs
}
```

### Step 2: Common Validation Failures

1. **Invalid itemId**:
   - `itemId` is undefined, null, or not a number
   - `itemId` is 0 or negative

2. **Invalid imageUrls**:
   - Not an array
   - Empty array (requires at least 1 URL)
   - More than 4 URLs
   - URLs are not strings
   - URLs are not valid HTTP/HTTPS format
   - Duplicate URLs

### Step 3: Check the AddImagesDialog Component

Open `src/presentation/components/items/AddImagesDialog.tsx` and verify:

1. **URL Format**: Are you entering valid URLs like:
   - ✅ `https://example.com/image.jpg`
   - ❌ `image.jpg` (relative paths not allowed)
   - ❌ `file:///C:/image.jpg` (local file paths not allowed)

2. **URL Count**: Are you adding 1-4 URLs?

## 🔧 **Quick Fixes**

### Fix 1: Add Debug Logging

Add this to `src/domain/items/itemsService.ts` before validation:

```typescript
async addImages(command: AddItemImagesCommand): Promise<void> {
  // DEBUG: Log the command being validated
  console.log('DEBUG: addImages command:', JSON.stringify(command, null, 2));
  
  const validationResult = validateAddImages(command);
  
  // DEBUG: Log validation result
  console.log('DEBUG: validation result:', validationResult);
  
  if (!validationResult.success) {
    console.error('DEBUG: Validation failed:', validationResult);
    // ... rest of error handling
  }
  // ... rest of method
}
```

### Fix 2: Check URL Format in AddImagesDialog

In `AddImagesDialog.tsx`, make sure URLs start with `http://` or `https://`:

```typescript
const handleAddUrl = () => {
  if (!newUrl.trim()) return;
  
  // Ensure URL has protocol
  let url = newUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  setImageUrls([...imageUrls, url]);
  setNewUrl('');
};
```

### Fix 3: Clear Previous Errors

In pages using addImages, clear errors before starting:

```typescript
const handleConfirmImages = async (imageUrls: string[]) => {
  // Clear any previous errors
  dispatch(clearError());
  
  // ... rest of the method
};
```

## 🧪 **Test Cases**

Try these URLs to verify validation works:

### ✅ Valid URLs:
```
https://via.placeholder.com/300x200/0066CC/FFFFFF?text=Item+Image+1
https://via.placeholder.com/300x200/FF6600/FFFFFF?text=Item+Image+2
https://picsum.photos/300/200?random=1
https://picsum.photos/300/200?random=2
```

### ❌ Invalid URLs (should show validation errors):
```
image.jpg                    (no protocol)
ftp://example.com/image.jpg  (wrong protocol)
                             (empty string)
file:///C:/image.jpg         (file protocol)
```

## 🔍 **Error State Management**

The issue might also be that errors from `addItemImagesThunk` are showing up when loading items because both operations use the same error state in Redux.

To fix this, modify the Redux slice to separate error states or ensure errors are cleared properly.

## 📞 **Next Steps**

1. Add the debug logging (Fix 1)
2. Open browser dev tools and try adding an image
3. Check the console for the debug output
4. Share the logged command and validation result for further analysis

This will help identify exactly what validation is failing and why.