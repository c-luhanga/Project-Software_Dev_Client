/**
 * Image Upload Abstraction
 * 
 * Follows Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP)
 * - SRP: Each class has single responsibility for image upload
 * - DIP: High-level modules depend on IImageUploader abstraction, not concrete implementations
 */

/**
 * Image upload contract following Interface Segregation Principle
 * Simple interface with single responsibility: upload images and return public URLs
 */
export interface IImageUploader {
  /**
   * Upload an image file and return a public URL
   * @param file - The image file to upload
   * @returns Promise resolving to the public URL of the uploaded image
   * @throws Error if upload fails
   */
  upload(file: File): Promise<string>;
}

/**
 * Firebase Image Uploader Implementation
 * TODO: Implement Firebase Storage integration
 * 
 * This will handle:
 * - File validation (size, type)
 * - Firebase Storage upload
 * - Public URL generation
 * - Error handling and retry logic
 */
export class FirebaseImageUploader implements IImageUploader {
  readonly config: {
    bucket?: string;
    maxSizeBytes?: number;
    allowedTypes?: string[];
  };

  constructor(config?: {
    bucket?: string;
    maxSizeBytes?: number;
    allowedTypes?: string[];
  }) {
    this.config = config || {};
  }

  async upload(_file: File): Promise<string> {
    // TODO: Implement Firebase Storage upload
    // 1. Validate file type and size
    // 2. Generate unique filename
    // 3. Upload to Firebase Storage
    // 4. Get public download URL
    // 5. Return URL
    
    throw new Error('FirebaseImageUploader not yet implemented. TODO: Add Firebase Storage integration.');
  }
}

/**
 * Local Mock Image Uploader for Development
 * Returns data URLs for immediate preview without external dependencies
 * Useful for testing and development when Firebase isn't configured
 */
export class LocalMockImageUploader implements IImageUploader {
  readonly config: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
  };

  constructor(config?: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
  }) {
    this.config = config || {};
  }

  async upload(file: File): Promise<string> {
    // Validate file type
    const allowedTypes = this.config?.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (default 5MB)
    const maxSize = this.config?.maxSizeBytes || 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large: ${file.size} bytes. Maximum allowed: ${maxSize} bytes`);
    }

    // Convert to data URL for immediate preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Image Upload Error Types
 * Provides specific error types for better error handling
 */
export class ImageUploadError extends Error {
  public code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED' | 'NETWORK_ERROR';
  public originalError?: Error;

  constructor(
    message: string,
    code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED' | 'NETWORK_ERROR',
    originalError?: Error
  ) {
    super(message);
    this.name = 'ImageUploadError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Image Upload Configuration
 * Shared configuration interface for all uploaders
 */
export interface ImageUploadConfig {
  maxSizeBytes: number;
  allowedTypes: string[];
  compressionQuality?: number;
}

/**
 * Default Image Upload Configuration
 */
export const DEFAULT_IMAGE_CONFIG: ImageUploadConfig = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  compressionQuality: 0.9
};

/**
 * Factory function for creating image uploaders
 * Follows Factory pattern for easy testing and configuration
 */
export function createImageUploader(
  type: 'firebase' | 'mock' = 'mock',
  config?: Partial<ImageUploadConfig>
): IImageUploader {
  const finalConfig = { ...DEFAULT_IMAGE_CONFIG, ...config };
  
  switch (type) {
    case 'firebase':
      return new FirebaseImageUploader(finalConfig);
    case 'mock':
      return new LocalMockImageUploader(finalConfig);
    default:
      throw new Error(`Unknown image uploader type: ${type}`);
  }
}

/*
 * Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - IImageUploader: Single purpose interface for image uploads
 *    - FirebaseImageUploader: Only handles Firebase-specific upload logic
 *    - LocalMockImageUploader: Only handles local mock functionality
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Profile components depend on IImageUploader abstraction
 *    - Can easily swap implementations (Firebase ↔ AWS ↔ Local)
 *    - No coupling to specific upload service
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Easy to add new uploaders (AWS, Cloudinary, etc.)
 *    - Existing code doesn't need modification
 * 
 * 4. Interface Segregation Principle (ISP):
 *    - Simple interface with only required methods
 *    - No forced dependencies on unused functionality
 * 
 * 5. Testability:
 *    - Easy to mock IImageUploader for testing
 *    - LocalMockImageUploader for development
 *    - Clear error types for test assertions
 * 
 * Usage Example in Profile Component:
 * 
 * const imageUploader = createImageUploader('mock'); // or 'firebase'
 * 
 * const handleImageUpload = async (file: File) => {
 *   try {
 *     const imageUrl = await imageUploader.upload(file);
 *     await updateProfile({ profileImageUrl: imageUrl });
 *   } catch (error) {
 *     console.error('Upload failed:', error);
 *   }
 * };
 * 
 * Future DI Integration:
 * 
 * // In DI container
 * getImageUploader(): IImageUploader {
 *   return createImageUploader(
 *     process.env.NODE_ENV === 'production' ? 'firebase' : 'mock'
 *   );
 * }
 * 
 * // In Redux thunk
 * const uploadImageThunk = createAsyncThunk(
 *   'profile/uploadImage',
 *   async (file: File, { extra }) => {
 *     const imageUploader = extra.container.getImageUploader();
 *     return await imageUploader.upload(file);
 *   }
 * );
 */