/**
 * Messaging Domain Service
 * 
 * Domain layer service implementing business logic following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles messaging business operations
 * - Open/Closed Principle (OCP): Extensible for new business rules without changing consumers
 * - Dependency Inversion Principle (DIP): Depends only on abstractions (IMessagingRepository)
 * 
 * Framework Independence:
 * - No React, Redux, HTTP, or UI framework dependencies
 * - Pure domain service with business logic only
 * - Can be used by any application or presentation layer
 */

import type { 
  IMessagingService, 
  IMessagingRepository,
  StartConversationCommand, 
  SendMessageCommand,
  MessageDto,
  ConversationListItem,
  PagedResult 
} from './contracts';
import { 
  validateStartConversation, 
  validateSendMessage,
  type ValidationError
} from './validators';

/**
 * Domain validation error for business rule violations
 * Extends Error to provide structured validation feedback
 */
export class MessagingValidationError extends Error {
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = errors.map(e => `${e.field}: ${e.message}`).join(', ');
    super(`Validation failed: ${message}`);
    this.name = 'MessagingValidationError';
    this.errors = errors;
  }
}

/**
 * MessagingService - Domain service implementation
 * 
 * Single Responsibility: Handles messaging business logic and validation
 * Open/Closed: Extensible for new business rules (content moderation, flood control)
 * Dependency Inversion: Depends only on IMessagingRepository abstraction
 * 
 * Business Responsibilities:
 * - Input validation using domain validators
 * - Business rule enforcement
 * - Coordination between validation and data access
 * - Future: Content moderation, rate limiting, conversation rules
 */
export class MessagingService implements IMessagingService {
  private readonly repository: IMessagingRepository;

  constructor(repository: IMessagingRepository) {
    this.repository = repository;
  }

  /**
   * Start a new conversation with another user
   * 
   * Business Logic:
   * 1. Validate input using domain validators
   * 2. Apply business rules (future: duplicate conversation check, user permissions)
   * 3. Delegate to repository for data persistence
   * 
   * Open/Closed: Future rules can be added here without changing callers
   * - Content filtering for initial message
   * - User relationship validation
   * - Rate limiting for conversation creation
   * 
   * @param command Raw input to validate and process
   * @returns Promise resolving to conversation ID
   * @throws MessagingValidationError for validation failures
   * @throws Repository errors for infrastructure failures
   */
  async startConversation(command: unknown): Promise<number> {
    // Step 1: Domain validation
    const validation = validateStartConversation(command);
    if (!validation.success) {
      throw new MessagingValidationError(validation.errors);
    }

    // At this point, TypeScript knows validation.success is true
    const validatedCommand = validation.data;

    // Step 2: Business rules (extensible for future requirements)
    await this.validateConversationBusinessRules(validatedCommand);

    // Step 3: Delegate to repository
    return this.repository.startConversation(validatedCommand);
  }

  /**
   * Send a message in an existing conversation
   * 
   * Business Logic:
   * 1. Validate input using domain validators
   * 2. Apply business rules (future: content moderation, flood control)
   * 3. Delegate to repository for data persistence
   * 
   * Open/Closed: Future rules can be added here without changing callers
   * - Content moderation and filtering
   * - Rate limiting and flood prevention
   * - Message encryption
   * - Spam detection
   * 
   * @param command Raw input to validate and process
   * @returns Promise resolving to sent message details
   * @throws MessagingValidationError for validation failures
   * @throws Repository errors for infrastructure failures
   */
  async send(command: unknown): Promise<MessageDto> {
    // Step 1: Domain validation
    const validation = validateSendMessage(command);
    if (!validation.success) {
      throw new MessagingValidationError(validation.errors);
    }

    // At this point, TypeScript knows validation.success is true
    const validatedCommand = validation.data;

    // Step 2: Business rules (extensible for future requirements)
    await this.validateMessageBusinessRules(validatedCommand);

    // Step 3: Delegate to repository
    return this.repository.send(validatedCommand);
  }

  /**
   * Get messages from a conversation with pagination
   * 
   * Currently a pass-through to repository, but designed for future business logic:
   * - Message filtering based on user permissions
   * - Read receipt tracking
   * - Message decryption
   * - Conversation access control
   * 
   * @param conversationId ID of the conversation
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   * @returns Promise resolving to paged message list
   * @throws Repository errors for infrastructure failures
   */
  async getConversation(
    conversationId: number, 
    page: number, 
    pageSize: number
  ): Promise<PagedResult<MessageDto>> {
    // Future: Add business rules here
    // - Conversation access validation
    // - Message filtering by user permissions
    // - Read status updates
    
    return this.repository.getConversation(conversationId, page, pageSize);
  }

  /**
   * Get user's inbox with all conversations
   * 
   * Currently a pass-through to repository, but designed for future business logic:
   * - Conversation filtering based on user preferences
   * - Priority sorting
   * - Unread count calculation
   * - Conversation archiving
   * 
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   * @returns Promise resolving to paged conversation list
   * @throws Repository errors for infrastructure failures
   */
  async listInbox(
    page: number, 
    pageSize: number
  ): Promise<PagedResult<ConversationListItem>> {
    // Future: Add business rules here
    // - Conversation filtering by user preferences
    // - Custom sorting (priority, unread, recent activity)
    // - Conversation grouping
    // - Archive/trash filtering
    
    return this.repository.listInbox(page, pageSize);
  }

  /**
   * Validate business rules for conversation creation
   * 
   * Open/Closed: New rules can be added without changing startConversation method
   * Future rules:
   * - Check if users can communicate (not blocked)
   * - Validate item ownership for item-based conversations
   * - Rate limiting for conversation creation
   * - User relationship validation
   * 
   * @param command Validated conversation command
   * @throws MessagingValidationError for business rule violations
   */
  private async validateConversationBusinessRules(
    _command: StartConversationCommand
  ): Promise<void> {
    // Placeholder for future business rules
    // Example future implementations:
    
    // 1. Rate limiting
    // if (await this.isRateLimited(command.otherUserId)) {
    //   throw new MessagingValidationError([{
    //     field: 'otherUserId',
    //     message: 'Too many conversation requests. Please try again later.'
    //   }]);
    // }
    
    // 2. User relationship validation
    // if (await this.areUsersBlocked(command.otherUserId)) {
    //   throw new MessagingValidationError([{
    //     field: 'otherUserId',
    //     message: 'Cannot start conversation with this user.'
    //   }]);
    // }
    
    // 3. Item ownership validation
    // if (command.itemId && !await this.canUserAccessItem(command.itemId)) {
    //   throw new MessagingValidationError([{
    //     field: 'itemId',
    //     message: 'Cannot start conversation about this item.'
    //   }]);
    // }
    
    // Currently no additional business rules
    return Promise.resolve();
  }

  /**
   * Validate business rules for message sending
   * 
   * Open/Closed: New rules can be added without changing send method
   * Future rules:
   * - Content moderation and filtering
   * - Rate limiting and flood prevention
   * - Spam detection
   * - Message encryption
   * - Conversation state validation
   * 
   * @param command Validated message command
   * @throws MessagingValidationError for business rule violations
   */
  private async validateMessageBusinessRules(
    _command: SendMessageCommand
  ): Promise<void> {
    // Placeholder for future business rules
    // Example future implementations:
    
    // 1. Content moderation
    // if (await this.containsInappropriateContent(command.content)) {
    //   throw new MessagingValidationError([{
    //     field: 'content',
    //     message: 'Message contains inappropriate content.'
    //   }]);
    // }
    
    // 2. Rate limiting
    // if (await this.isFloodLimited(command.conversationId)) {
    //   throw new MessagingValidationError([{
    //     field: 'conversationId',
    //     message: 'Sending messages too quickly. Please slow down.'
    //   }]);
    // }
    
    // 3. Conversation state validation
    // if (await this.isConversationArchived(command.conversationId)) {
    //   throw new MessagingValidationError([{
    //     field: 'conversationId',
    //     message: 'Cannot send message to archived conversation.'
    //   }]);
    // }
    
    // Currently no additional business rules
    return Promise.resolve();
  }
}

/**
 * Factory function to create MessagingService instance
 * Follows dependency injection pattern for easy testing and configuration
 * 
 * @param repository Repository implementation for data access
 * @returns Configured messaging service
 */
export function createMessagingService(repository: IMessagingRepository): IMessagingService {
  return new MessagingService(repository);
}

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - MessagingService: Only handles messaging business logic
 * - startConversation: Only validates and processes conversation creation
 * - send: Only validates and processes message sending
 * - getConversation/listInbox: Only coordinate data retrieval
 * - validateConversationBusinessRules: Only validates conversation business rules
 * - validateMessageBusinessRules: Only validates message business rules
 * 
 * Open/Closed Principle (OCP):
 * - Service is closed for modification, open for extension
 * - New business rules can be added to validation methods without changing public interface
 * - Future features (content moderation, rate limiting) can be added without breaking consumers
 * - Pass-through methods are designed to accommodate future business logic
 * - Business rule validation is separated and extensible
 * 
 * Liskov Substitution Principle (LSP):
 * - Any IMessagingService implementation can replace this one
 * - Maintains consistent error behavior and return types
 * - Repository abstraction ensures implementation independence
 * 
 * Interface Segregation Principle (ISP):
 * - Implements only IMessagingService interface methods
 * - No unnecessary dependencies or method implementations
 * - Clean separation between service and repository concerns
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends only on IMessagingRepository abstraction
 * - No concrete repository implementations
 * - No infrastructure, framework, or UI dependencies
 * - Domain validators provide pure validation logic
 * 
 * Benefits:
 * - Framework Independence: No React, Redux, or HTTP dependencies
 * - Business Logic Centralization: All messaging rules in one place
 * - Validation Integration: Uses domain validators for input validation
 * - Error Consistency: Structured error handling across all operations
 * - Extensibility: Easy to add new business rules without breaking changes
 * - Testability: Easy to mock repository for comprehensive testing
 * - Maintainability: Clear separation of concerns between validation, business logic, and data access
 * - Future-Proof: Designed to accommodate complex business requirements
 * 
 * Usage Examples:
 * 
 * // Application service usage
 * class MessageApplicationService {
 *   constructor(private messagingService: IMessagingService) {}
 * 
 *   async startConversation(input: unknown): Promise<number> {
 *     try {
 *       return await this.messagingService.startConversation(input);
 *     } catch (error) {
 *       if (error instanceof MessagingValidationError) {
 *         // Handle validation errors
 *         throw new ApplicationError(error.errors);
 *       }
 *       throw error; // Re-throw infrastructure errors
 *     }
 *   }
 * }
 * 
 * // Dependency injection setup
 * const httpClient = new AxiosApiClient(baseURL, authService);
 * const messagingRepo = createMessagingRepository(httpClient);
 * const messagingService = createMessagingService(messagingRepo);
 * 
 * // Redux thunk integration
 * const startConversationThunk = createAsyncThunk(
 *   'messaging/startConversation',
 *   async (command: unknown, { extra, rejectWithValue }) => {
 *     try {
 *       const { messagingService } = extra as Dependencies;
 *       return await messagingService.startConversation(command);
 *     } catch (error) {
 *       if (error instanceof MessagingValidationError) {
 *         return rejectWithValue(error.errors);
 *       }
 *       throw error;
 *     }
 *   }
 * );
 * 
 * // Testing with mocks
 * const mockRepository: IMessagingRepository = {
 *   startConversation: jest.fn(),
 *   send: jest.fn(),
 *   getConversation: jest.fn(),
 *   listInbox: jest.fn()
 * };
 * const testService = createMessagingService(mockRepository);
 * 
 * // Future business rule example
 * // In validateMessageBusinessRules method:
 * async validateMessageBusinessRules(command: SendMessageCommand): Promise<void> {
 *   // Content moderation
 *   if (await this.contentModerator.containsProfanity(command.content)) {
 *     throw new MessagingValidationError([{
 *       field: 'content',
 *       message: 'Message contains inappropriate language.'
 *     }]);
 *   }
 * 
 *   // Rate limiting
 *   const rateLimitResult = await this.rateLimiter.checkMessageRate(command.conversationId);
 *   if (!rateLimitResult.allowed) {
 *     throw new MessagingValidationError([{
 *       field: 'conversationId',
 *       message: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`
 *     }]);
 *   }
 * }
 */