/**
 * Image Upload Abstraction
 * 
 * Follows Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP)
 * - SRP: Each class has single responsibility for image upload
 * - DIP: High-level modules depend on IImageUploader abstraction, not concrete implementations
 */

/**
 * Image upload contract following Interface Segregation Principle (ISP)
 * Simple interface focused solely on image upload operations
 */
export interface IImageUploader {
  /**
   * Upload an image file and return a public URL
   * @param file - The image file to upload
   * @returns Promise resolving to the public URL of the uploaded image
   * @throws Error if upload fails or file validation fails
   */
  upload(file: File): Promise<string>;

  /**
   * Validate if file is a supported image type
   * @param file File to validate
   * @returns boolean indicating if file is valid image
   */
  isValidImageFile(file: File): boolean;

  /**
   * Get maximum allowed file size in bytes
   * @returns maximum file size in bytes
   */
  getMaxFileSize(): number;
}

/**
 * Firebase Image Uploader Implementation
 * TODO: Implement Firebase Storage integration when ready
 */
export class FirebaseImageUploader implements IImageUploader {
  private readonly maxFileSize: number;
  private readonly supportedTypes: string[];

  constructor(config?: {
    bucket?: string;
    maxSizeBytes?: number;
    allowedTypes?: string[];
  }) {
    this.maxFileSize = config?.maxSizeBytes ?? 5 * 1024 * 1024; // 5MB default
    this.supportedTypes = config?.allowedTypes ?? [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp'
    ];
  }

  async upload(file: File): Promise<string> {
    // Validate file
    if (!this.isValidImageFile(file)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size`);
    }

    // TODO: Implement Firebase Storage upload when ready
    // Example implementation:
    // const storage = getStorage();
    // const imageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    // const snapshot = await uploadBytes(imageRef, file);
    // return await getDownloadURL(snapshot.ref);
    
    throw new Error('FirebaseImageUploader not yet implemented. Use MockImageUploader for development.');
  }

  isValidImageFile(file: File): boolean {
    return this.supportedTypes.includes(file.type.toLowerCase());
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }
}

/**
 * Mock Image Uploader for Development and Testing
 * Returns blob URLs or fake CDN URLs based on configuration
 * Framework-agnostic implementation for development purposes
 */
export class MockImageUploader implements IImageUploader {
  private readonly maxFileSize: number;
  private readonly supportedTypes: string[];
  private readonly useFakeCdn: boolean;

  constructor(config?: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    useFakeCdn?: boolean;
  }) {
    this.maxFileSize = config?.maxSizeBytes ?? 5 * 1024 * 1024; // 5MB default
    this.supportedTypes = config?.allowedTypes ?? [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml'
    ];
    this.useFakeCdn = config?.useFakeCdn ?? false;
  }

  async upload(file: File): Promise<string> {
    // Validate file
    if (!this.isValidImageFile(file)) {
      throw new Error(`Unsupported file type: ${file.type}. Supported types: ${this.supportedTypes.join(', ')}`);
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size ${file.size} bytes exceeds maximum allowed size ${this.maxFileSize} bytes`);
    }

    // Simulate network delay for realistic development experience
    await this.simulateNetworkDelay();

    if (this.useFakeCdn) {
      // Return fake CDN URL for development
      return this.generateFakeCdnUrl(file);
    } else {
      // Return blob URL for immediate local use
      return URL.createObjectURL(file);
    }
  }

  isValidImageFile(file: File): boolean {
    return this.supportedTypes.includes(file.type.toLowerCase());
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  /**
   * Simulate network delay for realistic development experience
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 1000 + 500; // 500-1500ms delay
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate fake CDN URL for development purposes
   */
  private generateFakeCdnUrl(file: File): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(file.name) || 'jpg';
    
    return `https://fake-cdn.unishare.dev/images/${timestamp}_${randomId}.${extension}`;
  }

  /**
   * Extract file extension from filename
   */
  private getFileExtension(filename: string): string | null {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot + 1).toLowerCase() : null;
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
 * Factory function for creating image uploaders (DIP principle)
 * Allows easy swapping of implementations based on environment
 */
export function createImageUploader(
  type: 'firebase' | 'mock' = 'mock',
  config?: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    useFakeCdn?: boolean;
  }
): IImageUploader {
  switch (type) {
    case 'firebase':
      return new FirebaseImageUploader({
        maxSizeBytes: config?.maxSizeBytes,
        allowedTypes: config?.allowedTypes
      });
    case 'mock':
      return new MockImageUploader({
        maxSizeBytes: config?.maxSizeBytes,
        allowedTypes: config?.allowedTypes,
        useFakeCdn: config?.useFakeCdn
      });
    default:
      throw new Error(`Unknown image uploader type: ${type}`);
  }
}

/**
 * Enhanced factory class for more sophisticated creation patterns
 */
export class ImageUploaderFactory {
  /**
   * Create mock uploader for development and testing
   */
  static createMockUploader(options?: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    useFakeCdn?: boolean;
  }): IImageUploader {
    return new MockImageUploader(options);
  }

  /**
   * Create Firebase uploader for production (when implemented)
   */
  static createFirebaseUploader(options?: {
    bucket?: string;
    maxSizeBytes?: number;
    allowedTypes?: string[];
  }): IImageUploader {
    return new FirebaseImageUploader(options);
  }

  /**
   * Create uploader based on environment configuration
   */
  static createUploader(environment: 'development' | 'production' | 'test', config?: {
    bucket?: string;
    maxSizeBytes?: number;
    allowedTypes?: string[];
    useFakeCdn?: boolean;
  }): IImageUploader {
    switch (environment) {
      case 'development':
      case 'test':
        return this.createMockUploader({
          maxSizeBytes: config?.maxSizeBytes,
          allowedTypes: config?.allowedTypes,
          useFakeCdn: config?.useFakeCdn ?? false
        });

      case 'production':
        return this.createFirebaseUploader({
          bucket: config?.bucket,
          maxSizeBytes: config?.maxSizeBytes,
          allowedTypes: config?.allowedTypes
        });

      default:
        throw new Error(`Unsupported environment: ${environment}`);
    }
  }
}

/**
 * Default export for convenient access
 */
export default ImageUploaderFactory;

/*
 * Usage Examples:
 * 
 * // Development usage with blob URLs
 * const uploader = createImageUploader('mock');
 * const imageUrl = await uploader.upload(file);
 * 
 * // Development usage with fake CDN URLs
 * const uploaderWithCdn = createImageUploader('mock', { useFakeCdn: true });
 * const cdnUrl = await uploaderWithCdn.upload(file);
 * 
 * // Using factory class for mock uploader
 * const mockUploader = ImageUploaderFactory.createMockUploader({ useFakeCdn: true });
 * const url = await mockUploader.upload(file);
 * 
 * // Environment-based factory
 * const envUploader = ImageUploaderFactory.createUploader(
 *   process.env.NODE_ENV === 'production' ? 'production' : 'development',
 *   { useFakeCdn: true }
 * );
 * 
 * // Validation before upload
 * if (!uploader.isValidImageFile(file)) {
 *   console.error('Invalid file type');
 *   return;
 * }
 * 
 * if (file.size > uploader.getMaxFileSize()) {
 *   console.error('File too large');
 *   return;
 * }
 */

/*
 * SOLID Principles Implementation Summary:
 * 
 * Single Responsibility Principle (SRP):
 * - IImageUploader: Single responsibility for image upload contract
 * - MockImageUploader: Single responsibility for mock upload implementation  
 * - FirebaseImageUploader: Single responsibility for Firebase upload implementation
 * - ImageUploaderFactory: Single responsibility for creating uploader instances
 * 
 * Dependency Inversion Principle (DIP):
 * - High-level modules depend on IImageUploader abstraction
 * - Concrete implementations can be swapped without changing dependents
 * - Factory pattern enables configuration-based dependency injection
 * - No coupling to specific upload services
 * 
 * Open/Closed Principle (OCP):
 * - Easy to add new uploader implementations (S3, Cloudinary, etc.)
 * - Interface allows extension without modification
 * - Factory can be extended with new creation methods
 * 
 * Interface Segregation Principle (ISP):
 * - IImageUploader focused only on image upload operations
 * - No unrelated methods or dependencies
 * 
 * Clean Architecture Benefits:
 * - Framework agnostic: No React/UI dependencies  
 * - Testable: Easy to mock implementations
 * - Flexible: Support for multiple storage backends
 * - Type-safe: Full TypeScript support
 * - Environment-aware: Different implementations for different environments
 * - Development-friendly: Mock implementation with blob URLs and fake CDN URLs
 */