/**
 * Messaging Repository Implementation
 * 
 * Infrastructure layer implementation following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles messaging data access
 * - Dependency Inversion Principle (DIP): Depends on IApiClient abstraction
 * 
 * Framework Independence:
 * - No Redux, React, or UI framework imports
 * - Pure infrastructure concerns with HTTP API integration
 * - Can be used by any service or application layer
 */

import type { IApiClient } from '../http/IApiClient';
import { ApiError, AuthenticationError } from '../http/IApiClient';
import type { 
  IMessagingRepository, 
  StartConversationCommand, 
  SendMessageCommand,
  MessageDto,
  ConversationListItem,
  PagedResult 
} from '../../domain/messaging/contracts';

/**
 * Backend API request/response types
 * These match the C# backend DTOs exactly
 */
interface StartConversationRequest {
  readonly otherUserId: number;
  readonly itemId?: number;
}

interface StartConversationResponse {
  readonly conversationId: number;
}

interface SendMessageRequest {
  readonly conversationId: number;
  readonly content: string;
}

/**
 * Backend MessageDto structure
 * Maps to frontend MessageDto with potential property differences
 */
interface BackendMessageDto {
  readonly messageId: number;
  readonly conversationId: number;
  readonly senderId: number;
  readonly content: string;
  readonly timestamp: string;
  readonly senderName: string;
}

/**
 * Backend ConversationListItem structure
 * Maps to frontend ConversationListItem
 */
interface BackendConversationListItem {
  readonly conversationId: number;
  readonly itemId?: number;
  readonly lastMessage: string;
  readonly lastUpdated: string;
  readonly otherUserId: number;
  readonly otherUserName: string;
  readonly unreadCount: number;
}

/**
 * Backend PagedResult structure
 * Generic container for paginated responses
 */
interface BackendPagedResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/**
 * MessagingRepository - Infrastructure implementation
 * 
 * Single Responsibility: Only handles messaging HTTP API operations
 * Dependency Inversion: Depends on IApiClient abstraction, not concrete HTTP client
 * 
 * Responsibilities:
 * - HTTP API communication for messaging operations
 * - Request/response data transformation
 * - Error handling and propagation
 * - Backend-to-frontend DTO mapping
 */
export class MessagingRepository implements IMessagingRepository {
  private readonly apiClient: IApiClient;

  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Start a new conversation with another user
   * 
   * Maps to: POST /v1/Messages/conversations
   * 
   * @param command Domain command with user and optional item
   * @returns Promise resolving to conversation ID
   * @throws ApiError for API-related errors
   * @throws AuthenticationError for authentication failures
   */
  async startConversation(command: StartConversationCommand): Promise<number> {
    try {
      const request: StartConversationRequest = {
        otherUserId: command.otherUserId,
        itemId: command.itemId
      };

      const response = await this.apiClient.post<StartConversationResponse>(
        '/v1/Messages/conversations',
        request
      );

      return response.conversationId;
    } catch (error) {
      // Re-throw infrastructure errors as-is for upper layers to handle
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new ApiError(
        'Failed to start conversation',
        500,
        'Internal Server Error',
        '/v1/Messages/conversations'
      );
    }
  }

  /**
   * Send a message in an existing conversation
   * 
   * Maps to: POST /v1/Messages/send
   * 
   * @param command Domain command with conversation and message content
   * @returns Promise resolving to sent message details
   * @throws ApiError for API-related errors
   * @throws AuthenticationError for authentication failures
   */
  async send(command: SendMessageCommand): Promise<MessageDto> {
    try {
      const request: SendMessageRequest = {
        conversationId: command.conversationId,
        content: command.content
      };

      const response = await this.apiClient.post<BackendMessageDto>(
        '/v1/Messages/send',
        request
      );

      return this.mapToMessageDto(response);
    } catch (error) {
      // Re-throw infrastructure errors as-is
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new ApiError(
        'Failed to send message',
        500,
        'Internal Server Error',
        '/v1/Messages/send'
      );
    }
  }

  /**
   * Get messages from a conversation with pagination
   * 
   * Maps to: GET /v1/Messages/conversations/{conversationId}?page=&pageSize=
   * 
   * @param conversationId ID of the conversation
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   * @returns Promise resolving to paged message list
   * @throws ApiError for API-related errors
   * @throws AuthenticationError for authentication failures
   */
  async getConversation(
    conversationId: number, 
    page: number, 
    pageSize: number
  ): Promise<PagedResult<MessageDto>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      const response = await this.apiClient.get<BackendPagedResult<BackendMessageDto>>(
        `/v1/Messages/conversations/${conversationId}?${queryParams}`
      );

      return this.mapToPagedMessageResult(response);
    } catch (error) {
      // Re-throw infrastructure errors as-is
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new ApiError(
        'Failed to get conversation messages',
        500,
        'Internal Server Error',
        `/v1/Messages/conversations/${conversationId}`
      );
    }
  }

  /**
   * Get user's inbox with all conversations
   * 
   * Maps to: GET /v1/Messages/inbox?page=&pageSize=
   * 
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   * @returns Promise resolving to paged conversation list
   * @throws ApiError for API-related errors
   * @throws AuthenticationError for authentication failures
   */
  async listInbox(
    page: number, 
    pageSize: number
  ): Promise<PagedResult<ConversationListItem>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      const response = await this.apiClient.get<BackendPagedResult<BackendConversationListItem>>(
        `/v1/Messages/inbox?${queryParams}`
      );

      return this.mapToPagedConversationResult(response);
    } catch (error) {
      // Re-throw infrastructure errors as-is
      if (error instanceof ApiError || error instanceof AuthenticationError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new ApiError(
        'Failed to get inbox',
        500,
        'Internal Server Error',
        '/v1/Messages/inbox'
      );
    }
  }

  /**
   * Map backend MessageDto to domain MessageDto
   * Handles any property name differences between backend and frontend
   * 
   * @param backendDto Backend message structure
   * @returns Domain message DTO
   */
  private mapToMessageDto(backendDto: BackendMessageDto): MessageDto {
    return {
      messageId: backendDto.messageId,
      conversationId: backendDto.conversationId,
      senderId: backendDto.senderId,
      content: backendDto.content,
      timestamp: backendDto.timestamp
    };
  }

  /**
   * Map backend ConversationListItem to domain ConversationListItem
   * Handles any property name differences between backend and frontend
   * 
   * @param backendItem Backend conversation list item
   * @returns Domain conversation list item
   */
  private mapToConversationListItem(backendItem: BackendConversationListItem): ConversationListItem {
    return {
      conversationId: backendItem.conversationId,
      itemId: backendItem.itemId,
      lastMessage: backendItem.lastMessage,
      lastUpdated: backendItem.lastUpdated,
      otherUserId: backendItem.otherUserId,
      otherUserName: backendItem.otherUserName,
      unreadCount: backendItem.unreadCount
    };
  }

  /**
   * Map backend PagedResult<MessageDto> to domain PagedResult<MessageDto>
   * Transforms paginated message responses
   * 
   * @param backendResult Backend paged result
   * @returns Domain paged result
   */
  private mapToPagedMessageResult(
    backendResult: BackendPagedResult<BackendMessageDto>
  ): PagedResult<MessageDto> {
    return {
      items: backendResult.items.map(item => this.mapToMessageDto(item)),
      total: backendResult.total,
      page: backendResult.page,
      pageSize: backendResult.pageSize,
      totalPages: backendResult.totalPages,
      hasNextPage: backendResult.hasNextPage,
      hasPreviousPage: backendResult.hasPreviousPage
    };
  }

  /**
   * Map backend PagedResult<ConversationListItem> to domain PagedResult<ConversationListItem>
   * Transforms paginated conversation responses
   * 
   * @param backendResult Backend paged result
   * @returns Domain paged result
   */
  private mapToPagedConversationResult(
    backendResult: BackendPagedResult<BackendConversationListItem>
  ): PagedResult<ConversationListItem> {
    return {
      items: backendResult.items.map(item => this.mapToConversationListItem(item)),
      total: backendResult.total,
      page: backendResult.page,
      pageSize: backendResult.pageSize,
      totalPages: backendResult.totalPages,
      hasNextPage: backendResult.hasNextPage,
      hasPreviousPage: backendResult.hasPreviousPage
    };
  }
}

/**
 * Factory function to create MessagingRepository instance
 * Follows dependency injection pattern for easy testing and configuration
 * 
 * @param apiClient HTTP client implementation
 * @returns Configured messaging repository
 */
export function createMessagingRepository(apiClient: IApiClient): IMessagingRepository {
  return new MessagingRepository(apiClient);
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - MessagingRepository: Only handles messaging HTTP API operations
 * - startConversation: Only starts conversations via API
 * - send: Only sends messages via API  
 * - getConversation: Only retrieves conversation messages via API
 * - listInbox: Only retrieves user inbox via API
 * - Mapping methods: Only handle data transformation between layers
 * 
 * Open/Closed Principle (OCP):
 * - Repository interface is closed for modification, open for extension
 * - New messaging operations can be added without changing existing code
 * - Backend DTO mapping is isolated and can be extended
 * - Error handling patterns can be extended for new error types
 * 
 * Liskov Substitution Principle (LSP):
 * - Any IMessagingRepository implementation can replace this one
 * - Maintains contract compatibility with domain expectations
 * - Error behavior is consistent across implementations
 * 
 * Interface Segregation Principle (ISP):
 * - Implements only IMessagingRepository interface methods
 * - No unnecessary dependencies or method implementations
 * - Clean separation between HTTP concerns and domain logic
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on IApiClient abstraction, not concrete HTTP implementation
 * - No direct dependencies on axios, fetch, or specific HTTP libraries
 * - Can work with any IApiClient implementation (production, testing, mock)
 * - Domain contracts define the interface, not infrastructure concerns
 * 
 * Benefits:
 * - Framework Independence: No React, Redux, or UI dependencies
 * - HTTP Abstraction: Uses IApiClient for all network operations
 * - Error Consistency: Standardized error handling across all operations
 * - Backend Compatibility: Exact API endpoint matching with C# backend
 * - Type Safety: Full TypeScript support with proper error propagation
 * - Testability: Easy to mock IApiClient for comprehensive testing
 * - Maintainability: Clear separation between HTTP and domain concerns
 * - Extensibility: Easy to add new messaging operations or modify existing ones
 * 
 * Usage Examples:
 * 
 * // Service layer usage
 * class MessagingApplicationService {
 *   constructor(
 *     private messagingRepo: IMessagingRepository,
 *     private validator: MessageValidator
 *   ) {}
 * 
 *   async startConversation(command: unknown): Promise<number> {
 *     const validation = validateStartConversation(command);
 *     if (!validation.success) {
 *       throw new ValidationError(validation.errors);
 *     }
 *     return this.messagingRepo.startConversation(validation.data);
 *   }
 * }
 * 
 * // Repository creation with dependency injection
 * const httpClient = new AxiosApiClient(baseURL, authService);
 * const messagingRepo = createMessagingRepository(httpClient);
 * 
 * // Testing with mock
 * const mockClient: IApiClient = {
 *   post: jest.fn(),
 *   get: jest.fn(),
 *   // ... other methods
 * };
 * const testRepo = createMessagingRepository(mockClient);
 * 
 * // Integration with Redux thunks
 * const startConversationThunk = createAsyncThunk(
 *   'messaging/startConversation',
 *   async (command: StartConversationCommand, { extra }) => {
 *     const { messagingRepository } = extra as Dependencies;
 *     return messagingRepository.startConversation(command);
 *   }
 * );
 */