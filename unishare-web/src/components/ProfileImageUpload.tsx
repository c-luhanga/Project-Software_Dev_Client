/**
 * Image Upload Integration Example
 * 
 * Demonstrates how to integrate IImageUploader with profile components
 * following clean architecture and decoupling principles
 */

import React, { useState, useRef } from 'react';
import { createImageUploader, type IImageUploader, ImageUploadError } from '../infrastructure/media/imageUpload';
import { useProfile } from '../store/profileSlice-examples';

/**
 * Profile Image Upload Component
 * Demonstrates SRP and DIP integration with image upload abstraction
 */
export function ProfileImageUpload() {
  const { profile, updateProfile } = useProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create image uploader instance (could be injected via DI later)
  const imageUploader: IImageUploader = createImageUploader('mock'); // Switch to 'firebase' in production

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleImageUpload(file);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // 1. Upload image using abstraction (no coupling to specific service)
      const imageUrl = await imageUploader.upload(file);
      
      // 2. Set preview immediately
      setPreviewUrl(imageUrl);

      // 3. Update profile with new image URL (decoupled from upload mechanism)
      await updateProfile({
        profileImageUrl: imageUrl
      });

      console.log('Profile image updated successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      
      if (error instanceof ImageUploadError) {
        setUploadError(`Upload failed: ${error.message}`);
      } else {
        setUploadError('An unexpected error occurred during upload');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const currentImageUrl = previewUrl || profile?.profileImageUrl;

  return (
    <div className="profile-image-upload">
      <div className="image-container">
        {currentImageUrl ? (
          <img 
            src={currentImageUrl} 
            alt="Profile" 
            className="profile-image"
          />
        ) : (
          <div className="placeholder">
            <span>No Image</span>
          </div>
        )}
        
        <div className="upload-overlay">
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="upload-button"
          >
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {uploadError && (
        <div className="error-message">
          {uploadError}
          <button onClick={() => setUploadError(null)}>×</button>
        </div>
      )}

      <div className="upload-info">
        <small>Supported formats: JPEG, PNG, WebP (max 5MB)</small>
      </div>
    </div>
  );
}

/**
 * Future DI Container Integration
 * Shows how this would work with dependency injection
 */

// In container.ts (future enhancement):
/*
export class DIContainer {
  // ... existing services

  getImageUploader(): IImageUploader {
    // Use Firebase in production, mock in development
    const uploaderType = process.env.NODE_ENV === 'production' ? 'firebase' : 'mock';
    
    return createImageUploader(uploaderType, {
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
  }
}
*/

// In Redux slice (future enhancement):
/*
export const uploadProfileImageThunk = createAsyncThunk(
  'profile/uploadImage',
  async (file: File, { extra }) => {
    const container = extra.container as DIContainer;
    const imageUploader = container.getImageUploader();
    
    // Upload image
    const imageUrl = await imageUploader.upload(file);
    
    // Update profile with new image URL
    const userService = container.getUserService();
    return await userService.updateProfile({ profileImageUrl: imageUrl });
  }
);
*/

/**
 * Component Styles
 */
export const profileImageUploadStyles = `
.profile-image-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.image-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e0e0e0;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.upload-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-container:hover .upload-overlay {
  opacity: 1;
}

.upload-button {
  background: none;
  border: none;
  color: white;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 300px;
}

.error-message button {
  background: none;
  border: none;
  color: #c62828;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin-left: 8px;
}

.upload-info {
  text-align: center;
  color: #666;
}
`;

/*
 * Architecture Benefits Demonstrated:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - ProfileImageUpload: Only handles UI for image upload
 *    - IImageUploader: Only handles image upload logic
 *    - Profile update: Separate concern from image upload
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Component depends on IImageUploader abstraction
 *    - Can easily switch between Firebase, AWS, local mock
 *    - No coupling to specific upload service
 * 
 * 3. Decoupling:
 *    - Profile update takes a URL string
 *    - Doesn't care how the image was uploaded
 *    - Image upload is separate from profile management
 * 
 * 4. Testability:
 *    - Easy to mock IImageUploader for testing
 *    - Can test upload failure scenarios
 *    - Component logic separate from upload logic
 * 
 * 5. Flexibility:
 *    - Easy to add compression, resizing, multiple formats
 *    - Can switch upload providers without UI changes
 *    - Preview works immediately with data URLs
 */