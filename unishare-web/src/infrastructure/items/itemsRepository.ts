/**
 * Items Repository Implementation
 * 
 * Infrastructure layer implementation following SOLID principles:
 * - Single Responsibility Principle (SRP): Only responsible for item data access via HTTP
 * - Dependency Inversion Principle (DIP): Depends on IApiClient abstraction
 * - Interface Segregation Principle (ISP): Implements focused IItemsRepository interface
 * 
 * Framework Independence:
 * - No React, Redux, or UI framework dependencies
 * - Pure infrastructure layer with HTTP concerns only
 * - Uses abstracted IApiClient for HTTP operations
 * - Maps between API responses and domain models
 */

import type { 
  IItemsRepository, 
  ItemSummary, 
  ItemDetail, 
  PagedResult, 
  CreateItemCommand, 
  AddItemImagesCommand 
} from '../../domain/items/contracts';
import type { IApiClient } from '../http/IApiClient';

/**
 * API Response Types
 * Internal types for HTTP responses - not exposed to domain
 */
interface ApiItemSummary {
  id: number;  // Backend uses "id", not "itemId"
  title: string;
  price?: number;
  statusId: number;
  postedDate: string;
  thumbnailUrl?: string;
}

interface ApiItemDetail {
  id: number;  // Backend uses "id", not "itemId"
  title: string;
  description: string;
  categoryId?: number;
  categoryName?: string;
  price?: number;
  conditionId: number;
  statusId: number;
  sellerId: number;
  postedDate: string;
  images?: string[];  // Images might not be included in the DTO
}

interface ApiPagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiCreateItemResponse {
  itemId: number;
}

/**
 * Items Repository Implementation (SRP, DIP)
 * 
 * Single Responsibility: Handle HTTP-based item data access operations
 * Dependency Inversion: Depends on IApiClient abstraction, not concrete HTTP client
 */
export class ItemsRepository implements IItemsRepository {
  private readonly apiClient: IApiClient;

  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Search items with optional filters and pagination
   * 
   * Maps to: GET /api/items with query parameters
   * 
   * @param query Optional search query string
   * @param categoryId Optional category filter
   * @param page Page number (1-based, defaults to 1)
   * @param pageSize Items per page (defaults to 20)
   * @returns Promise resolving to paged search results
   * @throws Error if search fails or invalid parameters
   */
  async search(
    query?: string,
    categoryId?: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PagedResult<ItemSummary>> {
    try {
      // Build query parameters
      const params: Record<string, string | number> = {
        page,
        pageSize
      };

      if (query) {
        params.q = query;
      }

      if (categoryId) {
        params.categoryId = categoryId;
      }

      // Build URL with query parameters
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
      });
      
      const url = `/items?${searchParams.toString()}`;

      // Make HTTP request
      const response = await this.apiClient.get<ApiPagedResponse<ApiItemSummary>>(url);

      // Map API response to domain model
      return this.mapToPagedResult(response, this.mapToItemSummary);
    } catch (error) {
      throw new Error(
        `Failed to search items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get item details by ID
   * 
   * Maps to: GET /api/items/{id}
   * 
   * @param itemId The item ID to retrieve
   * @returns Promise resolving to complete item details
   * @throws Error if item not found or access denied
   */
  async getById(itemId: number): Promise<ItemDetail> {
    try {
      const response = await this.apiClient.get<ApiItemDetail>(`/items/${itemId}`);
      return this.mapToItemDetail(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(`Item with ID ${itemId} not found`);
      }
      if (error instanceof Error && error.message.includes('403')) {
        throw new Error(`Access denied to item with ID ${itemId}`);
      }
      throw new Error(
        `Failed to get item ${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a new item
   * 
   * Maps to: POST /api/items
   * 
   * @param command Item creation data
   * @returns Promise resolving to created item ID
   * @throws Error if creation fails or validation errors
   */
  async create(command: CreateItemCommand): Promise<number> {
    try {
      // Map domain command to API request body
      const requestBody = {
        title: command.title,
        description: command.description,
        conditionId: command.conditionId,
        ...(command.categoryId && { categoryId: command.categoryId }),
        ...(command.price && { price: command.price })
      };

      const response = await this.apiClient.post<ApiCreateItemResponse>(
        '/items',
        requestBody
      );

      return response.itemId;
    } catch (error) {
      throw new Error(
        `Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Add images to an existing item
   * 
   * Maps to: POST /api/items/{id}/images
   * 
   * @param command Image addition data
   * @returns Promise indicating operation completion
   * @throws Error if item not found, unauthorized, or upload fails
   */
  async addImages(command: AddItemImagesCommand): Promise<void> {
    try {
      const requestBody = {
        imageUrls: command.imageUrls
      };

      await this.apiClient.post<void>(
        `/items/${command.itemId}/images`,
        requestBody
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(`Item with ID ${command.itemId} not found`);
      }
      if (error instanceof Error && error.message.includes('403')) {
        throw new Error(`Unauthorized to add images to item ${command.itemId}`);
      }
      throw new Error(
        `Failed to add images to item ${command.itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

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
        formData
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

  /**
   * Mark an item as sold
   * 
   * Maps to: POST /api/items/{id}/mark-sold
   * 
   * @param itemId The item ID to mark as sold
   * @returns Promise indicating operation completion
   * @throws Error if item not found, unauthorized, or already sold
   */
  async markSold(itemId: number): Promise<void> {
    try {
      await this.apiClient.post<void>(`/items/${itemId}/mark-sold`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(`Item with ID ${itemId} not found`);
      }
      if (error instanceof Error && error.message.includes('403')) {
        throw new Error(`Unauthorized to mark item ${itemId} as sold`);
      }
      if (error instanceof Error && error.message.includes('409')) {
        throw new Error(`Item ${itemId} is already sold`);
      }
      throw new Error(
        `Failed to mark item ${itemId} as sold: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get current user's items
   * 
   * Maps to: GET /api/items?owner=self (fallback: GET /api/items/mine)
   * 
   * @returns Promise resolving to array of user's item summaries
   * @throws Error if unauthorized or fetch fails
   */
  async listMine(): Promise<ItemSummary[]> {
    try {
      // Try primary endpoint with owner=self parameter
      let response: ApiItemSummary[];
      
      try {
        const pagedResponse = await this.apiClient.get<ApiPagedResponse<ApiItemSummary>>(
          '/items?owner=self'
        );
        response = pagedResponse.items;
      } catch (primaryError) {
        // Fallback to dedicated endpoint if available
        try {
          response = await this.apiClient.get<ApiItemSummary[]>('/items/mine');
        } catch (fallbackError) {
          // If both fail, throw the original error
          throw primaryError;
        }
      }

      // Map API response to domain models
      return response.map(item => this.mapToItemSummary(item));
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required to list your items');
      }
      throw new Error(
        `Failed to list your items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Private mapping methods
   * Convert API responses to domain models
   */

  private mapToItemSummary(apiItem: ApiItemSummary): ItemSummary {
    return {
      itemId: apiItem.id,  // Map from backend "id" to frontend "itemId"
      title: apiItem.title,
      price: apiItem.price,
      statusId: apiItem.statusId,
      postedDate: apiItem.postedDate,
      thumbnailUrl: apiItem.thumbnailUrl
    };
  }

  private mapToItemDetail(apiItem: ApiItemDetail): ItemDetail {
    return {
      itemId: apiItem.id,  // Map from backend "id" to frontend "itemId"
      title: apiItem.title,
      description: apiItem.description,
      categoryId: apiItem.categoryId,
      categoryName: apiItem.categoryName,
      price: apiItem.price,
      conditionId: apiItem.conditionId,
      statusId: apiItem.statusId,
      sellerId: apiItem.sellerId,
      postedDate: apiItem.postedDate,
      images: apiItem.images ? [...apiItem.images] : [] // Handle undefined images
    };
  }

  private mapToPagedResult<TApi, TDomain>(
    apiResponse: ApiPagedResponse<TApi>,
    mapItem: (item: TApi) => TDomain
  ): PagedResult<TDomain> {
    return {
      items: apiResponse.items.map(mapItem),
      total: apiResponse.total,
      page: apiResponse.page,
      pageSize: apiResponse.pageSize,
      totalPages: apiResponse.totalPages,
      hasNextPage: apiResponse.hasNextPage,
      hasPreviousPage: apiResponse.hasPreviousPage
    };
  }
}

/**
 * Factory function for creating ItemsRepository (DIP)
 * Allows easy dependency injection and testing
 * 
 * @param apiClient The API client implementation to use
 * @returns Configured ItemsRepository instance
 * 
 * @example
 * const apiClient = new HttpApiClient(baseUrl, authToken);
 * const itemsRepo = createItemsRepository(apiClient);
 * 
 * // Use repository
 * const items = await itemsRepo.search("laptop", 1, 1, 10);
 */
export function createItemsRepository(apiClient: IApiClient): IItemsRepository {
  return new ItemsRepository(apiClient);
}

/**
 * Type guard helpers for API response validation
 * Ensures API responses match expected structure
 */
export const ApiResponseValidators = {
  /**
   * Validate API item summary response
   */
  isValidItemSummary(obj: unknown): obj is ApiItemSummary {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof (obj as any).id === 'number' &&
      typeof (obj as any).title === 'string' &&
      typeof (obj as any).statusId === 'number' &&
      typeof (obj as any).postedDate === 'string'
    );
  },

  /**
   * Validate API item detail response
   */
  isValidItemDetail(obj: unknown): obj is ApiItemDetail {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof (obj as any).id === 'number' &&
      typeof (obj as any).title === 'string' &&
      typeof (obj as any).description === 'string' &&
      typeof (obj as any).conditionId === 'number' &&
      typeof (obj as any).statusId === 'number' &&
      typeof (obj as any).sellerId === 'number' &&
      typeof (obj as any).postedDate === 'string' &&
      (Array.isArray((obj as any).images) || (obj as any).images === undefined)
    );
  },

  /**
   * Validate API paged response
   */
  isValidPagedResponse<T>(obj: unknown, itemValidator: (item: unknown) => item is T): obj is ApiPagedResponse<T> {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      Array.isArray((obj as any).items) &&
      (obj as any).items.every(itemValidator) &&
      typeof (obj as any).total === 'number' &&
      typeof (obj as any).page === 'number' &&
      typeof (obj as any).pageSize === 'number' &&
      typeof (obj as any).totalPages === 'number' &&
      typeof (obj as any).hasNextPage === 'boolean' &&
      typeof (obj as any).hasPreviousPage === 'boolean'
    );
  }
};

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - ItemsRepository: Only responsible for HTTP-based item data access
 * - Each method handles single HTTP operation and mapping
 * - Mapping methods focused on specific transformations
 * - No business logic, validation, or UI concerns
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on IApiClient abstraction, not concrete HTTP implementation
 * - Can work with any IApiClient implementation (fetch, axios, mock)
 * - No direct dependencies on specific HTTP libraries
 * - Repository interface defines contract for higher layers
 * 
 * Interface Segregation Principle (ISP):
 * - Implements focused IItemsRepository interface
 * - Each method has specific purpose and signature
 * - No unrelated methods or dependencies
 * 
 * Open/Closed Principle (OCP):
 * - Easy to extend with new item operations
 * - Mapping logic can be enhanced without breaking existing code
 * - Error handling can be customized per operation
 * 
 * Benefits:
 * - Framework Independence: No React, Redux, or UI dependencies
 * - HTTP Abstraction: Uses IApiClient for all HTTP operations
 * - Error Handling: Consistent error mapping with meaningful messages
 * - Type Safety: Full TypeScript support with proper typing
 * - Testable: Easy to mock IApiClient for unit testing
 * - Maintainable: Clear separation between API and domain models
 * 
 * HTTP Operations:
 * - GET /api/items (search with query parameters)
 * - GET /api/items/{id} (get item details)
 * - POST /api/items (create new item)
 * - POST /api/items/{id}/images (add images)
 * - POST /api/items/{id}/mark-sold (mark as sold)
 * - GET /api/items?owner=self or /api/items/mine (list user's items)
 * 
 * Error Handling:
 * - HTTP status code interpretation (404, 403, 409, 401)
 * - Meaningful error messages for business scenarios
 * - Graceful fallback for different API endpoint patterns
 * - Proper error propagation to service layer
 * 
 * Usage Examples:
 * 
 * // Dependency injection
 * const apiClient = new HttpApiClient();
 * const repository = new ItemsRepository(apiClient);
 * 
 * // Search items
 * const searchResults = await repository.search("laptop", 1, 1, 20);
 * 
 * // Get item details
 * const item = await repository.getById(123);
 * 
 * // Create new item
 * const newItemId = await repository.create({
 *   title: "MacBook Pro",
 *   description: "Excellent condition",
 *   conditionId: 2
 * });
 * 
 * // Add images
 * await repository.addImages({
 *   itemId: newItemId,
 *   imageUrls: ["https://example.com/image1.jpg"]
 * });
 */