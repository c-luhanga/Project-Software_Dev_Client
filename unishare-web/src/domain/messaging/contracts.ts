/**
 * Messaging Domain Contracts
 * 
 * Pure domain layer contracts following SOLID principles:
 * - Dependency Inversion Principle (DIP): No framework imports, depends on abstractions
 * - Interface Segregation Principle (ISP): Small, focused interfaces
 * - Single Responsibility Principle (SRP): Each interface has one clear purpose
 * 
 * Framework Independence:
 * - No React, Redux, HTTP, or UI framework dependencies
 * - Pure TypeScript interfaces and types only
 * - Can be implemented by any infrastructure layer
 */

/**
 * Data Transfer Objects (DTOs)
 */

/**
 * Conversation list item for inbox display
 * Represents a conversation summary with metadata for list views
 */
export interface ConversationListItem {
  readonly conversationId: number;
  readonly itemId?: number;
  readonly lastMessage?: string;
  readonly lastUpdated: string;
  readonly otherUserId: number;
  readonly otherUserName: string;
  readonly unreadCount?: number;
}

/**
 * Individual message data transfer object
 * Represents a single message within a conversation
 */
export interface MessageDto {
  readonly messageId: number;
  readonly conversationId: number;
  readonly senderId: number;
  readonly content: string;
  readonly timestamp: string;
}

/**
 * Generic paginated result container
 * Reusable pagination wrapper for any list-based API responses
 */
export interface PagedResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/**
 * Command Objects
 */

/**
 * Command to start a new conversation
 * Can be initiated from an item listing or directly with a user
 */
export interface StartConversationCommand {
  readonly itemId?: number;
  readonly otherUserId: number;
}

/**
 * Command to send a message within an existing conversation
 */
export interface SendMessageCommand {
  readonly conversationId: number;
  readonly content: string;
}

/**
 * Repository Interface (Data Access Layer)
 * 
 * Follows Interface Segregation Principle (ISP):
 * - Small, focused interface for messaging data operations only
 * - No unrelated methods that implementers don't need
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Abstract interface that infrastructure layer implements
 * - No concrete dependencies on specific technologies
 */
export interface IMessagingRepository {
  /**
   * Start a new conversation
   * 
   * @param cmd Conversation initiation command
   * @returns Promise resolving to new conversation ID
   * @throws Error if conversation creation fails
   */
  startConversation(cmd: StartConversationCommand): Promise<number>;

  /**
   * Send a message in an existing conversation
   * 
   * @param cmd Message sending command
   * @returns Promise resolving to created message details
   * @throws Error if message sending fails or conversation not found
   */
  send(cmd: SendMessageCommand): Promise<MessageDto>;

  /**
   * Get messages from a conversation with pagination
   * 
   * @param conversationId Conversation to retrieve messages from
   * @param page Page number (defaults to 1)
   * @param pageSize Items per page (defaults to 20)
   * @returns Promise resolving to paginated message list
   * @throws Error if conversation not found or access denied
   */
  getConversation(
    conversationId: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedResult<MessageDto>>;

  /**
   * List user's conversations (inbox) with pagination
   * 
   * @param page Page number (defaults to 1)
   * @param pageSize Items per page (defaults to 20)
   * @returns Promise resolving to paginated conversation list
   * @throws Error if inbox retrieval fails
   */
  listInbox(
    page?: number,
    pageSize?: number
  ): Promise<PagedResult<ConversationListItem>>;
}

/**
 * Service Interface (Business Logic Layer)
 * 
 * Follows Interface Segregation Principle (ISP):
 * - Focused on messaging business operations only
 * - Mirror of repository interface ensuring consistency
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Abstract interface for business logic layer
 * - Can depend on IMessagingRepository abstraction
 * - No concrete infrastructure dependencies
 */
export interface IMessagingService {
  /**
   * Start a new conversation with business logic validation
   * 
   * @param cmd Conversation initiation command
   * @returns Promise resolving to new conversation ID
   * @throws Error if validation fails or conversation creation fails
   */
  startConversation(cmd: StartConversationCommand): Promise<number>;

  /**
   * Send a message with business logic validation and processing
   * 
   * @param cmd Message sending command
   * @returns Promise resolving to created message details
   * @throws Error if validation fails or message sending fails
   */
  send(cmd: SendMessageCommand): Promise<MessageDto>;

  /**
   * Get conversation messages with business logic processing
   * 
   * @param conversationId Conversation to retrieve messages from
   * @param page Page number (defaults to 1)
   * @param pageSize Items per page (defaults to 20)
   * @returns Promise resolving to paginated message list
   * @throws Error if conversation not found or access denied
   */
  getConversation(
    conversationId: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedResult<MessageDto>>;

  /**
   * List user's conversations with business logic enhancements
   * 
   * @param page Page number (defaults to 1)
   * @param pageSize Items per page (defaults to 20)
   * @returns Promise resolving to paginated conversation list
   * @throws Error if inbox retrieval fails
   */
  listInbox(
    page?: number,
    pageSize?: number
  ): Promise<PagedResult<ConversationListItem>>;
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - ConversationListItem: Only represents conversation summaries
 * - MessageDto: Only represents individual messages
 * - PagedResult<T>: Only handles pagination metadata
 * - StartConversationCommand: Only contains conversation initiation data
 * - SendMessageCommand: Only contains message sending data
 * - IMessagingRepository: Only handles messaging data access
 * - IMessagingService: Only handles messaging business logic
 * 
 * Interface Segregation Principle (ISP):
 * - Small, focused interfaces with only necessary methods
 * - No "fat" interfaces forcing implementers to implement unused methods
 * - Clear separation between repository and service concerns
 * 
 * Dependency Inversion Principle (DIP):
 * - No concrete framework dependencies in domain layer
 * - All interfaces are abstractions that can be implemented by any technology
 * - Higher-level modules (services) depend on abstractions (interfaces)
 * - Infrastructure implementations depend on these abstractions
 * 
 * Benefits:
 * - Framework Independence: Can work with any HTTP client, database, UI framework
 * - Testability: Easy to mock interfaces for unit testing
 * - Flexibility: Can swap implementations without changing business logic
 * - Maintainability: Clear contracts and separation of concerns
 * - Reusability: Generic PagedResult can be used across different domains
 * 
 * Usage Examples:
 * 
 * // Service layer implementation
 * class MessagingService implements IMessagingService {
 *   constructor(private repository: IMessagingRepository) {}
 *   
 *   async startConversation(cmd: StartConversationCommand): Promise<number> {
 *     // Business logic validation
 *     // Delegate to repository
 *     return this.repository.startConversation(cmd);
 *   }
 * }
 * 
 * // Repository layer implementation
 * class MessagingRepository implements IMessagingRepository {
 *   constructor(private apiClient: IApiClient) {}
 *   
 *   async startConversation(cmd: StartConversationCommand): Promise<number> {
 *     // HTTP API calls
 *     // Data mapping
 *     // Return conversation ID
 *   }
 * }
 * 
 * // Redux thunk usage
 * const sendMessageThunk = createAsyncThunk<MessageDto, SendMessageCommand>(
 *   'messaging/sendMessage',
 *   async (cmd, { extra }) => {
 *     const messagingService = extra.container.messagingService;
 *     return messagingService.send(cmd);
 *   }
 * );
 */