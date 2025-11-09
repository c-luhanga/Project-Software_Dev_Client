/**
 * Items Service Implementation
 * 
 * Service layer implementation following SOLID principles:
 * - Single Responsibility Principle (SRP): Business logic orchestration for items
 * - Open/Closed Principle (OCP): Easy to extend with new business rules
 * - Dependency Inversion Principle (DIP): Depends only on IItemsRepository abstraction
 * 
 * Domain-Focused Service:
 * - Orchestrates validation and repository operations
 * - Enforces business rules and domain logic
 * - Framework-independent service layer
 * - Clear separation between validation, business logic, and data access
 */

import type { 
  IItemsService,
  IItemsRepository, 
  ItemSummary, 
  ItemDetail, 
  PagedResult, 
  CreateItemCommand, 
  AddItemImagesCommand 
} from './contracts';
import {
  validateAddImages,
  validateItemId,
  validateSearchParams,
  validateCreateItemWithBusinessRules
} from './validators';

/**
 * Business rule error for domain-specific validation failures
 */
export class BusinessRuleError extends Error {
  public readonly field?: string;
  public readonly code: string;

  constructor(message: string, code: string, field?: string) {
    super(message);
    this.name = 'BusinessRuleError';
    this.code = code;
    this.field = field;
  }
}

/**
 * Items Service Implementation (SRP, OCP, DIP)
 * 
 * Single Responsibility: Business logic orchestration for item operations
 * Open/Closed: Easy to extend with new business rules without modification
 * Dependency Inversion: Depends only on IItemsRepository abstraction
 */
export class ItemsService implements IItemsService {
  private readonly repository: IItemsRepository;

  constructor(repository: IItemsRepository) {
    this.repository = repository;
  }

  /**
   * Search items with business logic validation
   * 
   * Pass-through operation with parameter validation
   * Can be extended with additional business rules (OCP)
   * 
   * @param query Optional search query string
   * @param categoryId Optional category filter
   * @param page Page number (1-based)
   * @param pageSize Items per page
   * @returns Promise resolving to paged search results
   * @throws BusinessRuleError for validation failures
   */
  async search(
    query?: string,
    categoryId?: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedResult<ItemSummary>> {
    // Validate search parameters
    const validationResult = validateSearchParams({
      query,
      categoryId,
      page,
      pageSize
    });

    if (!validationResult.success) {
      throw new BusinessRuleError(
        validationResult.message || 'Search validation failed',
        'VALIDATION_ERROR'
      );
    }

    const validatedParams = validationResult.data!;

    // Future extension point: Add business rules for search
    // - Rate limiting per user
    // - Content filtering based on user preferences
    // - Geographic restrictions
    // - Category access control

    try {
      return await this.repository.search(
        validatedParams.query,
        validatedParams.categoryId,
        validatedParams.page,
        validatedParams.pageSize
      );
    } catch (error) {
      throw new BusinessRuleError(
        `Failed to search items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SEARCH_ERROR'
      );
    }
  }

  /**
   * Get item details with business logic
   * 
   * Pass-through operation with ID validation
   * Can be extended with access control rules (OCP)
   * 
   * @param itemId The item ID to retrieve
   * @returns Promise resolving to complete item details
   * @throws BusinessRuleError if item access not allowed
   */
  async get(itemId: number): Promise<ItemDetail> {
    // Validate item ID
    const validationResult = validateItemId(itemId);

    if (!validationResult.success) {
      throw new BusinessRuleError(
        validationResult.message || 'Item ID validation failed',
        'VALIDATION_ERROR',
        'itemId'
      );
    }

    // Future extension point: Add business rules for item access
    // - User-specific visibility rules
    // - Geographic restrictions
    // - Age verification for certain categories
    // - Premium content access control

    try {
      return await this.repository.getById(itemId);
    } catch (error) {
      throw new BusinessRuleError(
        `Failed to get item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_ERROR'
      );
    }
  }

  /**
   * Create item with business validation
   * 
   * Orchestrates validation and repository operations (SRP)
   * Uses enhanced validation with business rules
   * 
   * @param command Validated item creation data
   * @returns Promise resolving to created item ID
   * @throws BusinessRuleError for validation failures
   */
  async create(command: CreateItemCommand): Promise<number> {
    // Run validation with business rules
    const validationResult = validateCreateItemWithBusinessRules(command);

    if (!validationResult.success) {
      const firstError = Object.entries(validationResult.errors || {})[0];
      throw new BusinessRuleError(
        validationResult.message || 'Item validation failed',
        'VALIDATION_ERROR',
        firstError?.[0]
      );
    }

    const validatedCommand = validationResult.data!;

    // Future extension point: Add business rules for item creation
    // - User creation limits (daily/monthly)
    // - Category-specific rules
    // - Content moderation workflow
    // - Duplicate detection
    // - Price reasonableness for category

    try {
      return await this.repository.create(validatedCommand);
    } catch (error) {
      throw new BusinessRuleError(
        `Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_ERROR'
      );
    }
  }

  /**
   * Add images with business logic validation
   * 
   * Orchestrates validation and repository operations (SRP)
   * Enforces business rules for image management
   * 
   * @param command Validated image addition data
   * @returns Promise indicating successful business operation
   * @throws BusinessRuleError for validation failures
   */
  async addImages(command: AddItemImagesCommand): Promise<void> {
    // DEBUG: Log the command being validated
    console.log('🔍 DEBUG addImages - Command received:', {
      itemId: command.itemId,
      imageUrls: command.imageUrls,
      imageUrlsType: typeof command.imageUrls,
      imageUrlsLength: command.imageUrls?.length,
      commandKeys: Object.keys(command)
    });
    
    // Run basic validation
    const validationResult = validateAddImages(command);
    
    // DEBUG: Log validation result
    console.log('🔍 DEBUG addImages - Validation result:', {
      success: validationResult.success,
      message: validationResult.message,
      errors: validationResult.errors,
      hasData: !!validationResult.data
    });

    if (!validationResult.success) {
      const firstError = Object.entries(validationResult.errors || {})[0];
      console.error('❌ DEBUG addImages - Validation failed:', {
        firstError,
        allErrors: validationResult.errors,
        message: validationResult.message
      });
      throw new BusinessRuleError(
        validationResult.message || 'Image validation failed',
        'VALIDATION_ERROR',
        firstError?.[0]
      );
    }

    const validatedCommand = validationResult.data!;

    // Business rule: Check total image limit
    try {
      const item = await this.repository.getById(validatedCommand.itemId);
      const currentImageCount = item.images.length;
      const newImageCount = validatedCommand.imageUrls.length;
      const totalImages = currentImageCount + newImageCount;

      if (totalImages > 4) {
        throw new BusinessRuleError(
          `Cannot add ${newImageCount} images. Item already has ${currentImageCount} images. Maximum allowed is 4 total.`,
          'IMAGE_LIMIT_EXCEEDED',
          'imageUrls'
        );
      }

      // Future extension point: Add more business rules for images
      // - Image content validation (size, format, resolution)
      // - Duplicate image detection
      // - Inappropriate content detection
      // - User-specific image limits
      // - Category-specific image requirements

      await this.repository.addImages(validatedCommand);
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        throw error;
      }
      throw new BusinessRuleError(
        `Failed to add images: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ADD_IMAGES_ERROR'
      );
    }
  }

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

  /**
   * Mark item as sold with business validation
   * 
   * Pass-through operation with ID validation
   * Can be extended with business rules (OCP)
   * 
   * @param itemId The item ID to mark as sold
   * @returns Promise indicating successful business operation
   * @throws BusinessRuleError if item cannot be sold
   */
  async markSold(itemId: number): Promise<void> {
    // Validate item ID
    const validationResult = validateItemId(itemId);

    if (!validationResult.success) {
      throw new BusinessRuleError(
        validationResult.message || 'Item ID validation failed',
        'VALIDATION_ERROR',
        'itemId'
      );
    }

    // Future extension point: Add business rules for marking sold
    // - Verify user owns the item
    // - Check item is in sellable state
    // - Handle payment processing integration
    // - Send notifications to interested users
    // - Update analytics and reporting

    try {
      await this.repository.markSold(itemId);
    } catch (error) {
      throw new BusinessRuleError(
        `Failed to mark item as sold: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MARK_SOLD_ERROR'
      );
    }
  }

  /**
   * Get current user's items with business logic
   * 
   * Pass-through operation for user-specific data
   * Can be extended with filtering and sorting rules (OCP)
   * 
   * @returns Promise resolving to array of user's item summaries
   * @throws BusinessRuleError if user authentication required
   */
  async listMine(): Promise<ItemSummary[]> {
    // Future extension point: Add business rules for user items
    // - Filter by status (active, sold, draft)
    // - Sort by date, price, or popularity
    // - Add pagination for large collections
    // - Include draft items for owner
    // - Performance monitoring and caching

    try {
      return await this.repository.listMine();
    } catch (error) {
      throw new BusinessRuleError(
        `Failed to list your items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LIST_MINE_ERROR'
      );
    }
  }
}

/**
 * Factory function for creating ItemsService (DIP)
 * Allows easy dependency injection and testing
 * 
 * @param repository The repository implementation to use
 * @returns Configured ItemsService instance
 * 
 * @example
 * const repository = new ItemsRepository(apiClient);
 * const service = createItemsService(repository);
 * 
 * // Use service
 * const newItemId = await service.create({
 *   title: "MacBook Pro",
 *   description: "Excellent condition",
 *   conditionId: 2
 * });
 */
export function createItemsService(repository: IItemsRepository): IItemsService {
  return new ItemsService(repository);
}

/**
 * Business rule validation helpers
 * Centralized business logic that can be extended (OCP)
 */
export const ItemBusinessRules = {
  /**
   * Maximum number of images per item
   */
  MAX_IMAGES_PER_ITEM: 4,

  /**
   * Maximum number of items a user can create per day
   */
  MAX_ITEMS_PER_DAY: 10,

  /**
   * Check if user can create more items today
   */
  async canCreateMoreItems(_repository: IItemsRepository): Promise<boolean> {
    // This would require additional repository methods to track daily creation counts
    // Extension point for rate limiting business logic
    return true;
  },

  /**
   * Check if item is in valid state for status changes
   */
  canChangeItemStatus(_item: ItemDetail, _newStatus: number): boolean {
    // Extension point for status transition business rules
    // - Draft → Active (requires images and complete data)
    // - Active → Sold (requires buyer interaction)
    // - Active → Removed (owner or admin action)
    return true;
  },

  /**
   * Validate item ownership for modifications
   */
  async canModifyItem(_repository: IItemsRepository, _itemId: number, _userId: number): Promise<boolean> {
    // Extension point for ownership validation
    // Would require user context in service methods
    return true;
  }
};

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - ItemsService: Only responsible for business logic orchestration
 * - Each method handles single business operation
 * - Validation and repository access clearly separated
 * - Business rules centralized and focused
 * 
 * Open/Closed Principle (OCP):
 * - Easy to extend with new business rules without modifying existing code
 * - Future extension points clearly marked in comments
 * - Business rule helpers can be extended independently
 * - New validation rules can be added without changing service structure
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends only on IItemsRepository abstraction
 * - No dependencies on infrastructure implementations
 * - Easy to inject different repository implementations
 * - No coupling to specific HTTP clients or databases
 * 
 * Interface Segregation Principle (ISP):
 * - Implements focused IItemsService interface
 * - Each method has specific purpose and signature
 * - No unrelated methods or dependencies
 * 
 * Benefits:
 * - Business Logic Focus: Clear separation of concerns
 * - Validation Integration: Consistent validation across all operations
 * - Error Handling: Domain-specific error types with context
 * - Extensibility: Easy to add new business rules and validations
 * - Testability: Easy to mock repository for unit testing
 * - Type Safety: Full TypeScript support with proper error types
 * 
 * Business Logic Orchestration:
 * - create: validation → business rules → repository.create
 * - addImages: validation → total image check → repository.addImages
 * - Pass-through: validation → repository operation (search, get, markSold, listMine)
 * 
 * Extension Points (OCP):
 * - Search: Rate limiting, content filtering, geographic restrictions
 * - Get: Access control, user-specific visibility, premium content
 * - Create: Creation limits, category rules, content moderation, duplicate detection
 * - AddImages: Content validation, inappropriate content detection, user limits
 * - MarkSold: Ownership verification, payment processing, notifications
 * - ListMine: Filtering, sorting, pagination, draft inclusion
 * 
 * Usage Examples:
 * 
 * // Dependency injection
 * const repository = new ItemsRepository(apiClient);
 * const service = new ItemsService(repository);
 * 
 * // Create item with validation
 * try {
 *   const itemId = await service.create({
 *     title: "MacBook Pro 2023",
 *     description: "Excellent condition laptop",
 *     conditionId: 2,
 *     price: 150000
 *   });
 *   console.log('Created item:', itemId);
 * } catch (error) {
 *   if (error instanceof BusinessRuleError) {
 *     console.error('Business rule violation:', error.message, error.field);
 *   }
 * }
 * 
 * // Add images with business rule enforcement
 * try {
 *   await service.addImages({
 *     itemId: 123,
 *     imageUrls: ["https://example.com/image1.jpg"]
 *   });
 * } catch (error) {
 *   if (error instanceof BusinessRuleError && error.code === 'IMAGE_LIMIT_EXCEEDED') {
 *     console.error('Too many images:', error.message);
 *   }
 * }
 */