/**
 * Chat Page Container
 * 
 * Container component for individual conversation chat following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles chat page orchestration
 * - Dependency Inversion Principle (DIP): Uses Redux thunks instead of direct repository imports
 * 
 * Pure container pattern with no business logic or infrastructure dependencies
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Paper,
  Alert,
  Button,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { AppDispatch, RootState } from '../../../store/store';
import { 
  fetchConversationThunk,
  sendMessageThunk,
  addOptimisticMessage,
  removeOptimisticMessage,
  selectConversationThread,
  selectMessagingStatus,
  clearError
} from '../../../store/messagingSlice';
import { 
  selectWebSocketConnected, 
  selectWebSocketConnecting 
} from '../../../store/webSocketSlice';
import { selectAuthUser } from '../../../store/authSlice';
import { MessageThread } from '../../components/messaging/MessageThread';
import { MessageInput } from '../../components/messaging/MessageInput';

/**
 * Route parameters interface
 */
interface ChatPageParams extends Record<string, string | undefined> {
  conversationId: string;
}

/**
 * Styled components for chat page layout
 */
const PageContainer = styled(Container)(() => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  maxWidth: 'none !important',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  gap: theme.spacing(2),
}));

const ChatContent = styled(Paper)(() => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 0,
}));

const ThreadContainer = styled(Box)({
  flex: 1,
  overflow: 'hidden',
});

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const LoadMoreContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

/**
 * ChatPage Container Component
 * 
 * Single Responsibility: Orchestrates individual conversation display and messaging
 * Dependency Inversion: Uses Redux thunks instead of direct service imports
 * 
 * Features:
 * - Auto-fetches conversation on mount and param changes
 * - Handles message sending with optimistic updates
 * - Supports pagination (load older messages)
 * - Error handling and loading states
 * - Auto-scroll to bottom on new messages
 * 
 * @returns Rendered chat page
 */
export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { conversationId } = useParams<ChatPageParams>();

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Parse conversation ID
  const conversationIdNum = conversationId ? parseInt(conversationId, 10) : null;

  // Select state from Redux store (DIP: no direct service dependencies)
  const thread = useSelector((state: RootState) => 
    conversationIdNum ? selectConversationThread(state, conversationIdNum) : undefined
  );
  const currentUser = useSelector(selectAuthUser);
  const { loading, sending, error } = useSelector(selectMessagingStatus);
  const wsConnected = useSelector(selectWebSocketConnected);
  const wsConnecting = useSelector(selectWebSocketConnecting);

  /**
   * Fetch conversation data when component mounts or conversationId changes
   * DIP: Uses thunk instead of direct repository call
   */
  useEffect(() => {
    if (conversationIdNum) {
      setCurrentPage(1); // Reset pagination on conversation change
      
      // Fetch initial data only - no polling
      dispatch(fetchConversationThunk({ 
        conversationId: conversationIdNum, 
        page: 1, 
        pageSize 
      }) as any);
    }
  }, [dispatch, conversationIdNum]);

  /**
   * Handle navigation back to inbox
   */
  const handleBackToInbox = () => {
    navigate('/inbox');
  };

  /**
   * Handle message sending with optimistic updates
   * DIP: Uses thunk instead of direct service call
   */
  const handleSendMessage = useCallback(async (content: string) => {
    if (!conversationIdNum || !currentUser) return;

    // Generate optimistic message ID
    const optimisticId = Date.now();

    // Add optimistic message for immediate UI feedback
    dispatch(addOptimisticMessage({
      messageId: optimisticId,
      conversationId: conversationIdNum,
      senderId: currentUser.userId,
      content,
      timestamp: new Date().toISOString()
    }));

    try {
      // Send message via thunk
      const result = await dispatch(sendMessageThunk({
        conversationId: conversationIdNum,
        content
      }) as any);

      // Check if sending failed
      if (sendMessageThunk.rejected.match(result)) {
        // Remove optimistic message on error
        dispatch(removeOptimisticMessage({
          conversationId: conversationIdNum,
          messageId: optimisticId
        }));
      } else if (sendMessageThunk.fulfilled.match(result)) {
        // Success: immediately refresh to get the real message and any new ones
        console.log('✅ Message sent successfully, refreshing conversation...');
        dispatch(fetchConversationThunk({ 
          conversationId: conversationIdNum, 
          page: 1, 
          pageSize 
        }) as any);
      }
      // Success case is handled automatically by the thunk fulfilled case
    } catch (error) {
      // Fallback error handling
      dispatch(removeOptimisticMessage({
        conversationId: conversationIdNum,
        messageId: optimisticId
      }));
    }
  }, [dispatch, conversationIdNum, currentUser]);

  /**
   * Handle loading older messages (pagination)
   * DIP: Uses thunk for data fetching
   */
  const handleLoadOlderMessages = () => {
    if (!conversationIdNum || loading === 'loading') return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    dispatch(fetchConversationThunk({
      conversationId: conversationIdNum,
      page: nextPage,
      pageSize
    }) as any);
  };

  /**
   * Handle error dismissal
   */
  const handleErrorDismiss = () => {
    dispatch(clearError());
  };

  // Validation and loading states
  if (!conversationIdNum) {
    return (
      <PageContainer>
        <Alert severity="error">
          Invalid conversation ID
        </Alert>
      </PageContainer>
    );
  }

  const isLoading = loading === 'loading';
  const hasMessages = thread && thread.items.length > 0;
  const hasMoreMessages = thread && thread.page < Math.ceil(thread.total / thread.pageSize);
  const hasError = !!error;

  return (
    <PageContainer>
      {/* Header */}
      <ChatHeader>
        <IconButton 
          onClick={handleBackToInbox}
          edge="start"
          aria-label="Back to inbox"
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h6" component="h1" flex={1}>
          Conversation
        </Typography>

        {hasMessages && (
          <Typography variant="body2" color="text.secondary">
            {thread.total} message{thread.total !== 1 ? 's' : ''}
          </Typography>
        )}

        {/* WebSocket Connection Status */}
        <Chip
          label={wsConnected ? 'Live' : wsConnecting ? 'Connecting' : 'Offline'}
          color={wsConnected ? 'success' : wsConnecting ? 'warning' : 'error'}
          size="small"
          variant="outlined"
          sx={{ 
            fontSize: '0.75rem',
            height: '24px',
            '& .MuiChip-label': {
              padding: '0 8px'
            }
          }}
        />
      </ChatHeader>

      {/* Error Alert */}
      {hasError && (
        <Alert 
          severity="error" 
          onClose={handleErrorDismiss}
          sx={{ m: 2 }}
        >
          {error}
        </Alert>
      )}

      <ChatContent elevation={0}>
        {/* Load More Button (for pagination) */}
        {hasMoreMessages && !isLoading && (
          <LoadMoreContainer>
            <Button 
              variant="outlined" 
              onClick={handleLoadOlderMessages}
              size="small"
            >
              Load older messages
            </Button>
          </LoadMoreContainer>
        )}

        {/* Message Thread */}
        <ThreadContainer>
          {hasMessages || isLoading ? (
            <MessageThread
              messages={thread?.items || []}
              currentUserId={currentUser?.userId || 0}
              loading={isLoading && currentPage === 1}
            />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              p={4}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No messages yet
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Start the conversation by sending a message below
              </Typography>
            </Box>
          )}
        </ThreadContainer>

        {/* Message Input */}
        <InputContainer>
          <MessageInput
            onSend={handleSendMessage}
            sending={sending}
            maxLength={4000}
          />
        </InputContainer>
      </ChatContent>
    </PageContainer>
  );
};

export default ChatPage;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - ChatPage: Only handles chat page orchestration and navigation
 * - handleSendMessage: Only handles message sending with optimistic updates
 * - handleLoadOlderMessages: Only handles pagination logic
 * - handleBackToInbox: Only handles navigation back to inbox
 * 
 * Open/Closed Principle (OCP):
 * - Extensible through additional Redux state without changing component
 * - Pagination logic can be extended (infinite scroll vs buttons)
 * - Message sending can be enhanced through thunk modifications
 * - Error handling can be customized through Redux actions
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on Redux abstractions (thunks) instead of concrete services
 * - No direct repository or service imports
 * - All data access through Redux state management
 * - Testable through Redux store mocking
 * 
 * Benefits:
 * - Pure Container Pattern: Only orchestrates state and presentation
 * - Optimistic Updates: Immediate UI feedback with error rollback
 * - Pagination Support: Load older messages on demand
 * - Type Safety: Full TypeScript support with route params
 * - Navigation Integration: React Router for back navigation
 * - Error Handling: Comprehensive error display and dismissal
 * - Loading States: Proper loading feedback during operations
 * - Auto-scroll: Message thread handles scroll positioning
 * - Responsive Design: Material-UI responsive layout
 * 
 * Usage Examples:
 * 
 * // Route configuration
 * <Route path="/inbox/:conversationId" element={<ChatPage />} />
 * 
 * // Navigation to specific conversation
 * const navigate = useNavigate();
 * navigate(`/inbox/${conversationId}`);
 * 
 * // Testing approach
 * const mockStore = createMockStore({
 *   messaging: {
 *     threads: {
 *       123: { items: mockMessages, total: 5, page: 1, pageSize: 50 }
 *     },
 *     loading: 'succeeded',
 *     sending: false,
 *     error: undefined
 *   },
 *   auth: {
 *     user: { userId: 1, username: 'testuser' }
 *   }
 * });
 * 
 * render(
 *   <Provider store={mockStore}>
 *     <MemoryRouter initialEntries={['/inbox/123']}>
 *       <Route path="/inbox/:conversationId" element={<ChatPage />} />
 *     </MemoryRouter>
 *   </Provider>
 * );
 * 
 * // Optimistic update flow
 * const handleSend = async (content: string) => {
 *   // 1. Add optimistic message immediately
 *   dispatch(addOptimisticMessage({ ... }));
 *   
 *   // 2. Send via thunk
 *   const result = await dispatch(sendMessageThunk({ ... }));
 *   
 *   // 3. Handle success/failure
 *   if (sendMessageThunk.rejected.match(result)) {
 *     dispatch(removeOptimisticMessage({ ... }));
 *   }
 * };
 * 
 * // Pagination integration
 * const handleLoadMore = () => {
 *   dispatch(fetchConversationThunk({
 *     conversationId,
 *     page: currentPage + 1,
 *     pageSize: 50
 *   }));
 * };
 */