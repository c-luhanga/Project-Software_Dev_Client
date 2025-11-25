/**
 * Items Domain Contracts
 * 
 * Pure domain interfaces following SOLID principles:
 * - Dependency Inversion Principle (DIP): Depend on abstractions, not concretions
 * - Interface Segregation Principle (ISP): Small, focused interfaces
 * - Single Responsibility Principle (SRP): Each contract has one clear purpose
 * 
 * Framework Independence:
 * - No React, Vue, Angular dependencies
 * - No HTTP client (axios, fetch) dependencies  
 * - No database/ORM dependencies
 * - Pure TypeScript contracts for maximum portability
 * 
 * Domain Focus:
 * - Pure business logic concepts
 * - Framework-agnostic data structures
 * - Clear separation between DTOs and Commands
 * - Reusable across different presentation layers
 */

/**
 * Item summary data transfer object
 * Lightweight DTO for listing and search views
 */
export interface ItemSummary {
  readonly itemId: number;
  readonly title: string;
  readonly price?: number;
  readonly statusId: number;
  readonly postedDate: string;
  readonly thumbnailUrl?: string;
}

/**
 * Complete item details data transfer object
 * Full item information for detail views
 */
export interface ItemDetail {
  readonly itemId: number;
  readonly title: string;
  readonly description: string;
  readonly categoryId?: number;
  readonly categoryName?: string;
  readonly price?: number;
  readonly conditionId: number;
  readonly statusId: number;
  readonly sellerId: number;
  readonly sellerHouse?: string;
  readonly postedDate: string;
  readonly images: readonly string[];
}

/**
 * Generic paged result container
 * Reusable pagination wrapper for any data type
 * 
 * @template T The type of items being paginated
 */
export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/**
 * Command for creating a new item
 * 
 * Follows Interface Segregation Principle (ISP):
 * - Contains only fields needed for item creation
 * - Framework-agnostic: no validation, UI, or HTTP concerns
 * - Pure business data without implementation details
 * 
 * @example
 * const cmd: CreateItemCommand = {
 *   title: "MacBook Pro 2023",
 *   description: "Excellent condition laptop...",
 *   categoryId: 1,
 *   price: 1500,
 *   conditionId: 2
 * };
 */
export interface CreateItemCommand {
  /** Item title (required) */
  readonly title: string;
  /** Item description (required) */
  readonly description: string;
  /** Category ID (optional) */
  readonly categoryId?: number;
  /** Item price in cents (optional) */
  readonly price?: number;
  /** Condition ID (required) */
  readonly conditionId: number;
}

/**
 * Command for adding images to an existing item
 * 
 * Separate command following Single Responsibility Principle:
 * - Only responsible for image addition
 * - Separate from item creation for flexibility
 * - Allows batch image upload operations
 * 
 * @example
 * const cmd: AddItemImagesCommand = {
 *   itemId: 123,
 *   imageUrls: [
 *     "https://cdn.example.com/image1.jpg",
 *     "https://cdn.example.com/image2.jpg"
 *   ]
 * };
 */
export interface AddItemImagesCommand {
  /** Target item ID */
  readonly itemId: number;
  /** Array of image URLs to add */
  readonly imageUrls: readonly string[];
}

/**
 * Command for updating an existing item
 * 
 * Partial update command following Single Responsibility Principle:
 * - Only responsible for item updates
 * - All fields are optional for partial updates
 * - Preserves fields not included in the update
 * 
 * @example
 * const cmd: UpdateItemCommand = {
 *   title: "Updated Title",
 *   price: 75.50,
 *   conditionId: 2
 *   // description and categoryId will remain unchanged
 * };
 */
export interface UpdateItemCommand {
  /** Updated item title (optional) */
  readonly title?: string;
  /** Updated item description (optional) */
  readonly description?: string;
  /** Updated category ID (optional) */
  readonly categoryId?: number;
  /** Updated item price (optional) */
  readonly price?: number;
  /** Updated condition ID (optional) */
  readonly conditionId?: number;
}

/**
 * Items repository contract (DIP abstraction)
 * Defines data access operations without implementation details
 * 
 * Interface Segregation Principle (ISP):
 * - Focused only on item data operations
 * - No unrelated methods or dependencies
 * - Clear separation of concerns
 */
export interface IItemsRepository {
  /**
   * Search items with optional filters and pagination
   * 
   * @param query Optional search query string
   * @param categoryId Optional category filter
   * @param page Page number (1-based, defaults to 1)
   * @param pageSize Items per page (defaults to 20)
   * @returns Promise resolving to paged search results
   * @throws Error if search fails or invalid parameters
   * 
   * @example
   * // Search all items
   * const results = await repository.search();
   * 
   * // Search with query and category
   * const filtered = await repository.search("laptop", 1, 1, 10);
   */
  search(
    query?: string,
    categoryId?: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedResult<ItemSummary>>;

  /**
   * Get item details by ID
   * 
   * @param itemId The item ID to retrieve
   * @returns Promise resolving to complete item details
   * @throws Error if item not found or access denied
   */
  getById(itemId: number): Promise<ItemDetail>;

  /**
   * Create a new item
   * 
   * @param command Item creation data
   * @returns Promise resolving to created item ID
   * @throws Error if creation fails or validation errors
   */
  create(command: CreateItemCommand): Promise<number>;

  /**
   * Update an existing item
   * 
   * @param itemId The item ID to update
   * @param command Item update data
   * @returns Promise resolving to updated item details
   * @throws Error if item not found, unauthorized, or update fails
   */
  update(itemId: number, command: UpdateItemCommand): Promise<ItemDetail>;

  /**
   * Add images to an existing item
   * 
   * @param command Image addition data
   * @returns Promise indicating operation completion
   * @throws Error if item not found, unauthorized, or upload fails
   */
  addImages(command: AddItemImagesCommand): Promise<void>;

  /**
   * Upload image files to an existing item
   * 
   * @param itemId The item ID
   * @param files Array of File objects to upload
   * @returns Promise resolving to array of uploaded image URLs
   * @throws Error if item not found, unauthorized, or upload fails
   */
  uploadImageFiles(itemId: number, files: File[]): Promise<string[]>;

  /**
   * Mark an item as sold
   * 
   * @param itemId The item ID to mark as sold
   * @returns Promise indicating operation completion
   * @throws Error if item not found, unauthorized, or already sold
   */
  markSold(itemId: number): Promise<void>;

  /**
   * Update item status
   * 
   * @param itemId The item ID to update
   * @param statusId The new status ID (1=Active, 2=Pending, 3=Sold, 4=Withdrawn)
   * @returns Promise indicating operation completion
   * @throws Error if item not found, unauthorized, or invalid status
   */
  updateStatus(itemId: number, statusId: number): Promise<void>;

  /**
   * Get current user's items
   * 
   * @returns Promise resolving to array of user's item summaries
   * @throws Error if unauthorized or fetch fails
   */
  listMine(): Promise<ItemSummary[]>;
}

/**
 * Items service contract (DIP abstraction)
 * Defines business operations for item management
 * Segregated interface focusing only on item operations (ISP)
 * 
 * Service Layer Responsibilities:
 * - Business logic validation and processing
 * - Error handling and mapping
 * - Orchestration between multiple repositories
 * - Domain rule enforcement
 */
export interface IItemsService {
  /**
   * Search items with business logic validation
   * Handles business rules, validation, and error mapping
   * 
   * @param query Optional search query string
   * @param categoryId Optional category filter
   * @param page Page number (1-based)
   * @param pageSize Items per page
   * @returns Promise resolving to paged search results
   * @throws BusinessLogicError for validation failures
   * @throws AuthorizationError if access denied
   */
  search(
    query?: string,
    categoryId?: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedResult<ItemSummary>>;

  /**
   * Get item details with business logic
   * Applies business rules and access control
   * 
   * @param itemId The item ID to retrieve
   * @returns Promise resolving to complete item details
   * @throws BusinessLogicError if item access not allowed
   * @throws NotFoundError if item doesn't exist
   */
  get(itemId: number): Promise<ItemDetail>;

  /**
   * Create item with business validation
   * Validates business rules and processes creation
   * 
   * @param command Validated item creation data
   * @returns Promise resolving to created item ID
   * @throws BusinessLogicError for validation failures
   * @throws AuthorizationError if user cannot create items
   */
  create(command: CreateItemCommand): Promise<number>;

  /**
   * Update item with business validation
   * Validates business rules and processes update
   * 
   * @param itemId The item ID to update
   * @param command Validated item update data
   * @returns Promise resolving to updated item details
   * @throws BusinessLogicError for validation failures
   * @throws AuthorizationError if user cannot update this item
   * @throws NotFoundError if item doesn't exist
   */
  update(itemId: number, command: UpdateItemCommand): Promise<ItemDetail>;

  /**
   * Add images with business logic validation
   * Validates image requirements and business rules
   * 
   * @param command Validated image addition data
   * @returns Promise indicating successful business operation
   * @throws BusinessLogicError for validation failures
   * @throws AuthorizationError if user cannot modify item
   */
  addImages(command: AddItemImagesCommand): Promise<void>;

  /**
   * Upload image files with business logic validation
   * Validates file requirements and business rules
   * 
   * @param itemId The item ID
   * @param files Array of File objects to upload
   * @returns Promise resolving to array of uploaded image URLs
   * @throws BusinessLogicError for validation failures
   * @throws AuthorizationError if user cannot modify item
   */
  uploadImageFiles(itemId: number, files: File[]): Promise<string[]>;

  /**
   * Mark item as sold with business validation
   * Applies business rules for selling items
   * 
   * @param itemId The item ID to mark as sold
   * @returns Promise indicating successful business operation
   * @throws BusinessLogicError if item cannot be sold
   * @throws AuthorizationError if user cannot modify item
   */
  markSold(itemId: number): Promise<void>;

  /**
   * Update item status with business validation
   * Applies business rules for status transitions
   * 
   * @param itemId The item ID to update
   * @param statusId The new status ID (1=Active, 2=Pending, 3=Sold, 4=Withdrawn)
   * @returns Promise indicating successful business operation
   * @throws BusinessLogicError if status transition not allowed
   * @throws AuthorizationError if user cannot modify item
   */
  updateStatus(itemId: number, statusId: number): Promise<void>;

  /**
   * Get current user's items with business logic
   * Returns items owned by the current user with proper filtering
   * 
   * @returns Promise resolving to array of user's item summaries
   * @throws AuthorizationError if user authentication required
   */
  listMine(): Promise<ItemSummary[]>;
}

/**
 * Item Status Enumeration
 * Common status values for items
 */
export const ItemStatus = {
  DRAFT: 1,
  ACTIVE: 2,
  SOLD: 3,
  REMOVED: 4,
  FLAGGED: 5
} as const;

export type ItemStatusType = typeof ItemStatus[keyof typeof ItemStatus];

/**
 * Item Condition Enumeration
 * Common condition values for items
 */
export const ItemCondition = {
  NEW: 1,
  LIKE_NEW: 2,
  GOOD: 3,
  FAIR: 4,
  POOR: 5
} as const;

export type ItemConditionType = typeof ItemCondition[keyof typeof ItemCondition];

/**
 * Type helpers for ensuring valid pagination parameters
 */
export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Type helper for search parameters
 */
export interface SearchParams extends Partial<PaginationParams> {
  readonly query?: string;
  readonly categoryId?: number;
}

/**
 * Error types for better error handling
 */
export class ItemNotFoundError extends Error {
  constructor(itemId: number) {
    super(`Item with ID ${itemId} not found`);
    this.name = 'ItemNotFoundError';
  }
}

export class ItemAccessDeniedError extends Error {
  constructor(itemId: number) {
    super(`Access denied to item with ID ${itemId}`);
    this.name = 'ItemAccessDeniedError';
  }
}

export class ItemAlreadySoldError extends Error {
  constructor(itemId: number) {
    super(`Item with ID ${itemId} is already sold`);
    this.name = 'ItemAlreadySoldError';
  }
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - ItemSummary: Only for lightweight item data
 * - ItemDetail: Only for complete item information
 * - PagedResult: Only for pagination metadata
 * - CreateItemCommand: Only for item creation data
 * - AddItemImagesCommand: Only for image addition
 * 
 * Interface Segregation Principle (ISP):
 * - IItemsRepository: Only data access methods
 * - IItemsService: Only business operations
 * - Separate interfaces for different concerns
 * - No forced dependencies on unrelated methods
 * 
 * Dependency Inversion Principle (DIP):
 * - High-level modules depend on abstractions (interfaces)
 * - No coupling to specific implementations
 * - Framework-agnostic contracts
 * - Easily testable and mockable
 * 
 * Open/Closed Principle (OCP):
 * - Easy to extend with new item types
 * - Can add new commands without modifying existing contracts
 * - Interfaces allow multiple implementations
 * 
 * Benefits:
 * - Framework agnostic: No React/UI dependencies
 * - Highly testable: Easy to mock implementations
 * - Flexible: Support for multiple storage backends
 * - Type-safe: Full TypeScript support
 * - Maintainable: Clear separation of concerns
 * - Reusable: Contracts can be used across different layers
 */