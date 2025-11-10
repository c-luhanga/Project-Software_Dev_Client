/**
 * Messaging Redux Slice
 * 
 * State management for messaging feature following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles messaging state
 * - Dependency Inversion Principle (DIP): Resolves IMessagingService from thunk extra
 * 
 * Framework Integration:
 * - Redux Toolkit for state management
 * - Async thunks with dependency injection
 * - Optimistic updates with rollback support
 */

import { createSlice, createAsyncThunk, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { ThunkExtraArgument } from './store';
import type { 
  ConversationListItem, 
  MessageDto, 
  PagedResult,
  StartConversationCommand,
  SendMessageCommand
} from '../domain/messaging/contracts';
import { MessagingValidationError } from '../domain/messaging/messagingService';

/**
 * Messaging state structure
 */
export interface MessagingState {
  inbox: PagedResult<ConversationListItem> | null;
  threads: Record<number, PagedResult<MessageWithOptimistic> | undefined>;
  sending: boolean;
  loading: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
}

/**
 * Initial state
 */
const initialState: MessagingState = {
  inbox: null,
  threads: {},
  sending: false,
  loading: 'idle',
  error: undefined
};

/**
 * Thunk parameter types
 */
interface FetchInboxParams {
  page?: number;
  pageSize?: number;
}

interface FetchConversationParams {
  conversationId: number;
  page?: number;
  pageSize?: number;
}

interface StartConversationParams {
  itemId?: number;
  otherUserId: number;
}

interface SendMessageParams {
  conversationId: number;
  content: string;
}

/**
 * Fetch user's inbox with conversations
 * 
 * DIP: Resolves IMessagingService from thunk extra for dependency injection
 */
export const fetchInboxThunk = createAsyncThunk<
  PagedResult<ConversationListItem>,
  FetchInboxParams,
  { extra: ThunkExtraArgument; rejectValue: string }
>(
  'messaging/fetchInbox',
  async ({ page = 1, pageSize = 20 }, { extra, rejectWithValue }) => {
    try {
      const messagingService = extra.container.messagingService;
      return await messagingService.listInbox(page, pageSize);
    } catch (error) {
      if (error instanceof MessagingValidationError) {
        return rejectWithValue(`Validation error: ${error.message}`);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch inbox');
    }
  }
);

/**
 * Fetch messages from a specific conversation
 * 
 * DIP: Resolves IMessagingService from thunk extra for dependency injection
 */
export const fetchConversationThunk = createAsyncThunk<
  { conversationId: number; result: PagedResult<MessageDto> },
  FetchConversationParams,
  { extra: ThunkExtraArgument; rejectValue: string }
>(
  'messaging/fetchConversation',
  async ({ conversationId, page = 1, pageSize = 50 }, { extra, rejectWithValue }) => {
    try {
      const messagingService = extra.container.messagingService;
      const result = await messagingService.getConversation(conversationId, page, pageSize);
      return { conversationId, result };
    } catch (error) {
      if (error instanceof MessagingValidationError) {
        return rejectWithValue(`Validation error: ${error.message}`);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch conversation');
    }
  }
);

/**
 * Start a new conversation with another user
 * 
 * DIP: Resolves IMessagingService from thunk extra for dependency injection
 */
export const startConversationThunk = createAsyncThunk<
  number,
  StartConversationParams,
  { extra: ThunkExtraArgument; rejectValue: string }
>(
  'messaging/startConversation',
  async ({ itemId, otherUserId }, { extra, rejectWithValue }) => {
    try {
      const messagingService = extra.container.messagingService;
      const command: StartConversationCommand = { itemId, otherUserId };
      return await messagingService.startConversation(command);
    } catch (error) {
      if (error instanceof MessagingValidationError) {
        return rejectWithValue(`Validation error: ${error.message}`);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to start conversation');
    }
  }
);

/**
 * Send a message in a conversation with optimistic update support
 * 
 * DIP: Resolves IMessagingService from thunk extra for dependency injection
 */
export const sendMessageThunk = createAsyncThunk<
  MessageDto,
  SendMessageParams,
  { extra: ThunkExtraArgument; rejectValue: string }
>(
  'messaging/sendMessage',
  async ({ conversationId, content }, { extra, rejectWithValue }) => {
    try {
      const messagingService = extra.container.messagingService;
      const command: SendMessageCommand = { conversationId, content };
      return await messagingService.send(command);
    } catch (error) {
      if (error instanceof MessagingValidationError) {
        return rejectWithValue(`Validation error: ${error.message}`);
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send message');
    }
  }
);

/**
 * Optimistic message for UI updates before server confirmation
 */
interface OptimisticMessage {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  timestamp: string;
  isOptimistic?: boolean;
}

/**
 * Extended MessageDto with optimistic flag for internal state management
 */
interface MessageWithOptimistic extends MessageDto {
  isOptimistic?: boolean;
}

/**
 * Messaging slice with reducers
 * 
 * SRP: Only handles messaging state transitions
 */
const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = undefined;
    },

    /**
     * Reset messaging state
     */
    resetMessaging: () => initialState,

    /**
     * Add optimistic message for immediate UI feedback
     * Used before sendMessageThunk completes
     */
    addOptimisticMessage: (state, action: PayloadAction<OptimisticMessage>) => {
      const { conversationId } = action.payload;
      const thread = state.threads[conversationId];
      
      if (thread) {
        // Add optimistic message to existing thread
        const optimisticMessage: MessageWithOptimistic = {
          ...action.payload,
          isOptimistic: true
        };
        
        state.threads[conversationId] = {
          ...thread,
          items: [...thread.items, optimisticMessage],
          total: thread.total + 1
        };
      }
    },

    /**
     * Remove optimistic message (on error rollback)
     */
    removeOptimisticMessage: (state, action: PayloadAction<{ conversationId: number; messageId: number }>) => {
      const { conversationId, messageId } = action.payload;
      const thread = state.threads[conversationId];
      
      if (thread) {
        state.threads[conversationId] = {
          ...thread,
          items: thread.items.filter(msg => !(msg.messageId === messageId && (msg as any).isOptimistic)),
          total: Math.max(0, thread.total - 1)
        };
      }
    },

    /**
     * Update optimistic message with real message data
     */
    replaceOptimisticMessage: (state, action: PayloadAction<{ conversationId: number; optimisticId: number; realMessage: MessageDto }>) => {
      const { conversationId, optimisticId, realMessage } = action.payload;
      const thread = state.threads[conversationId];
      
      if (thread) {
        const messageIndex = thread.items.findIndex(msg => 
          msg.messageId === optimisticId && (msg as any).isOptimistic
        );
        
        if (messageIndex !== -1) {
          const updatedItems = [...thread.items];
          updatedItems[messageIndex] = realMessage;
          
          state.threads[conversationId] = {
            ...thread,
            items: updatedItems
          };
        }
      }
    },

    /**
     * Receive real-time message via SignalR
     */
    receiveMessage: (state, action: PayloadAction<MessageDto>) => {
      const message = action.payload;
      const { conversationId } = message;
      const thread = state.threads[conversationId];
      
      if (thread) {
        // Check if message already exists (avoid duplicates)
        const existingMessage = thread.items.find(msg => msg.messageId === message.messageId);
        if (!existingMessage) {
          // Remove any optimistic message with same content and similar timestamp
          const filteredItems = thread.items.filter(msg => {
            if (!(msg as any).isOptimistic) return true;
            // Remove optimistic if content matches and timestamp is within 10 seconds
            const optimisticTime = new Date(msg.timestamp).getTime();
            const realTime = new Date(message.timestamp).getTime();
            const timeDiff = Math.abs(realTime - optimisticTime);
            return !(msg.content === message.content && timeDiff < 10000);
          });

          // Add new message to the thread
          const updatedItems = [...filteredItems, message];
          // Sort by timestamp to maintain order
          updatedItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          state.threads[conversationId] = {
            ...thread,
            items: updatedItems,
            total: Math.max(thread.total, updatedItems.length)
          };
        }
      }
      
      // Update inbox to show latest message
      if (state.inbox) {
        const conversationIndex = state.inbox.items.findIndex(conv => conv.conversationId === conversationId);
        if (conversationIndex !== -1) {
          const updatedItems = [...state.inbox.items];
          updatedItems[conversationIndex] = {
            ...updatedItems[conversationIndex],
            lastMessage: message.content,
            lastUpdated: message.timestamp,
            unreadCount: (updatedItems[conversationIndex].unreadCount || 0) + 1
          };
          
          state.inbox = {
            ...state.inbox,
            items: updatedItems
          };
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch Inbox
    builder
      .addCase(fetchInboxThunk.pending, (state) => {
        state.loading = 'loading';
        state.error = undefined;
      })
      .addCase(fetchInboxThunk.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.inbox = action.payload;
        state.error = undefined;
      })
      .addCase(fetchInboxThunk.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to fetch inbox';
      });

    // Fetch Conversation
    builder
      .addCase(fetchConversationThunk.pending, (state) => {
        state.loading = 'loading';
        state.error = undefined;
      })
      .addCase(fetchConversationThunk.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const { conversationId, result } = action.payload;
        
        // Merge/replace thread pages correctly
        const existingThread = state.threads[conversationId];
        if (existingThread && result.page > 1) {
          // Append to existing thread (pagination)
          state.threads[conversationId] = {
            ...result,
            items: [...existingThread.items, ...result.items]
          };
        } else {
          // Replace thread (first page or refresh)
          state.threads[conversationId] = result;
        }
        
        state.error = undefined;
      })
      .addCase(fetchConversationThunk.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to fetch conversation';
      });

    // Start Conversation
    builder
      .addCase(startConversationThunk.pending, (state) => {
        state.loading = 'loading';
        state.error = undefined;
      })
      .addCase(startConversationThunk.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.error = undefined;
        // Note: conversationId is returned and can be used by caller
      })
      .addCase(startConversationThunk.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to start conversation';
      });

    // Send Message
    builder
      .addCase(sendMessageThunk.pending, (state) => {
        state.sending = true;
        state.error = undefined;
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        state.sending = false;
        state.error = undefined;
        
        // Replace optimistic message with real message
        const realMessage = action.payload;
        const thread = state.threads[realMessage.conversationId];
        
        if (thread) {
          // Find and replace optimistic message or add new message
          const optimisticIndex = thread.items.findIndex(msg => (msg as any).isOptimistic);
          
          if (optimisticIndex !== -1) {
            // Replace optimistic message
            const updatedItems = [...thread.items];
            updatedItems[optimisticIndex] = realMessage;
            
            state.threads[realMessage.conversationId] = {
              ...thread,
              items: updatedItems
            };
          } else {
            // Add new message (fallback)
            state.threads[realMessage.conversationId] = {
              ...thread,
              items: [...thread.items, realMessage],
              total: thread.total + 1
            };
          }
        }
      })
      .addCase(sendMessageThunk.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload || 'Failed to send message';
        
        // Note: Optimistic message rollback should be handled by component
        // using removeOptimisticMessage action
      });
  }
});

/**
 * Action creators
 */
export const { 
  clearError, 
  resetMessaging, 
  addOptimisticMessage, 
  removeOptimisticMessage, 
  replaceOptimisticMessage,
  receiveMessage
} = messagingSlice.actions;

/**
 * Selectors following SRP - each selector has single responsibility
 */

/**
 * Select inbox data
 */
export const selectInbox = (state: RootState): PagedResult<ConversationListItem> | null => 
  state.messaging.inbox;

/**
 * Select specific conversation thread by ID
 */
export const selectConversationThread = (state: RootState, conversationId: number): PagedResult<MessageWithOptimistic> | undefined => 
  state.messaging.threads[conversationId];

/**
 * Select all conversation threads
 */
export const selectAllThreads = (state: RootState): Record<number, PagedResult<MessageWithOptimistic> | undefined> => 
  state.messaging.threads;

/**
 * Select sending state
 */
export const selectSending = (state: RootState): boolean => 
  state.messaging.sending;

/**
 * Select loading state
 */
export const selectLoading = (state: RootState): 'idle' | 'loading' | 'succeeded' | 'failed' => 
  state.messaging.loading;

/**
 * Select error state
 */
export const selectError = (state: RootState): string | undefined => 
  state.messaging.error;

/**
 * Select combined loading/error state for UI convenience
 */
export const selectMessagingStatus = createSelector(
  [(state: RootState) => state.messaging.loading,
   (state: RootState) => state.messaging.sending,
   (state: RootState) => state.messaging.error],
  (loading: 'idle' | 'loading' | 'succeeded' | 'failed', sending: boolean, error: string | undefined) => ({
    loading,
    sending,
    error
  })
);

/**
 * Select if there are any conversations loaded
 */
export const selectHasConversations = (state: RootState): boolean => 
  state.messaging.inbox !== null && state.messaging.inbox.items.length > 0;

/**
 * Select total unread message count across all conversations
 */
export const selectTotalUnreadCount = (state: RootState): number => {
  if (!state.messaging.inbox) return 0;
  
  return state.messaging.inbox.items.reduce((total, conversation) => 
    total + (conversation.unreadCount || 0), 0
  );
};

/**
 * Export reducer
 */
export default messagingSlice.reducer;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - MessagingState: Only manages messaging-related state
 * - fetchInboxThunk: Only fetches inbox data
 * - fetchConversationThunk: Only fetches conversation messages
 * - startConversationThunk: Only starts new conversations
 * - sendMessageThunk: Only sends messages
 * - Each selector: Single data selection responsibility
 * - Each reducer: Single state transition responsibility
 * 
 * Open/Closed Principle (OCP):
 * - Thunks are extensible through service layer changes
 * - State structure can be extended without breaking existing reducers
 * - Selectors can be added without modifying existing ones
 * - Optimistic update system is extensible for different message types
 * 
 * Dependency Inversion Principle (DIP):
 * - Thunks depend on IMessagingService abstraction via extra.container
 * - No direct dependencies on concrete service implementations
 * - Container provides dependency injection for all services
 * - Testable through service mocking
 * 
 * Benefits:
 * - Type Safety: Full TypeScript support with strict typing
 * - Optimistic Updates: Immediate UI feedback with rollback on error
 * - Pagination Support: Proper merging of paginated results
 * - Error Handling: Comprehensive error states with validation support
 * - Dependency Injection: Clean service resolution through thunk extra
 * - State Normalization: Efficient conversation thread management
 * - Selector Performance: Memoized selectors for optimized re-renders
 * - Testing: Easy to mock services and test state transitions
 * 
 * Usage Examples:
 * 
 * // Fetch inbox
 * dispatch(fetchInboxThunk({ page: 1, pageSize: 20 }));
 * 
 * // Fetch conversation messages
 * dispatch(fetchConversationThunk({ conversationId: 123, page: 1 }));
 * 
 * // Start new conversation
 * const result = await dispatch(startConversationThunk({ 
 *   otherUserId: 456, 
 *   itemId: 789 
 * }));
 * if (startConversationThunk.fulfilled.match(result)) {
 *   const conversationId = result.payload;
 *   // Navigate to conversation
 * }
 * 
 * // Send message with optimistic update
 * const optimisticId = Date.now(); // Temporary ID
 * dispatch(addOptimisticMessage({
 *   messageId: optimisticId,
 *   conversationId: 123,
 *   senderId: currentUserId,
 *   content: 'Hello!',
 *   timestamp: new Date().toISOString()
 * }));
 * 
 * const result = await dispatch(sendMessageThunk({ 
 *   conversationId: 123, 
 *   content: 'Hello!' 
 * }));
 * 
 * if (sendMessageThunk.rejected.match(result)) {
 *   // Rollback optimistic update
 *   dispatch(removeOptimisticMessage({ 
 *     conversationId: 123, 
 *     messageId: optimisticId 
 *   }));
 * }
 * 
 * // Component usage
 * const inbox = useSelector(selectInbox);
 * const thread = useSelector(state => selectConversationThread(state, conversationId));
 * const { loading, sending, error } = useSelector(selectMessagingStatus);
 */