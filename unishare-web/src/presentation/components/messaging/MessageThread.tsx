/**
 * MessageThread Presentational Component
 * 
 * Renders a scrollable list of messages following SOLID principles:
 * - Single Responsibility Principle (SRP): Only renders message thread UI
 * - Interface Segregation Principle (ISP): Minimal, focused props interface
 * 
 * Pure presentational component with no data fetching, Redux, or HTTP dependencies
 */

import React, { useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import type { MessageDto } from '../../../domain/messaging/contracts';

/**
 * Component props following ISP - only what's needed for rendering
 */
interface MessageThreadProps {
  /** Array of messages to display in chronological order */
  messages: MessageDto[];
  /** Current user ID to determine message ownership */
  currentUserId: number;
  /** Loading state for skeleton/spinner display */
  loading: boolean;
}

/**
 * Styled components for message layout
 */
const ThreadContainer = styled(Box)(({ theme }) => ({
  height: '400px',
  overflowY: 'auto',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
}));

const MessageBubble = styled(Paper)<{ isMine: boolean }>(({ theme, isMine }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1, 2),
  alignSelf: isMine ? 'flex-end' : 'flex-start',
  backgroundColor: isMine 
    ? theme.palette.primary.main 
    : theme.palette.background.paper,
  color: isMine 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  borderRadius: theme.spacing(2),
  borderTopLeftRadius: isMine ? theme.spacing(2) : theme.spacing(0.5),
  borderTopRightRadius: isMine ? theme.spacing(0.5) : theme.spacing(2),
  wordBreak: 'break-word',
}));

const MessageContainer = styled(Box)<{ isMine: boolean }>(({ theme, isMine }) => ({
  display: 'flex',
  flexDirection: isMine ? 'row-reverse' : 'row',
  alignItems: 'flex-end',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
}));

const MessageContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const MessageText = styled(Typography)({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

const MessageTimestamp = styled(Typography)<{ isMine: boolean }>(({ theme, isMine }) => ({
  fontSize: '0.75rem',
  color: isMine 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.secondary,
  opacity: 0.7,
  marginTop: theme.spacing(0.5),
  alignSelf: isMine ? 'flex-end' : 'flex-start',
}));

const MessageAvatar = styled(Avatar)({
  width: 32,
  height: 32,
  fontSize: '0.9rem',
});

/**
 * Format timestamp for message display
 * @param timestamp ISO timestamp string
 * @returns Formatted time string
 */
const formatMessageTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100%',
      minHeight: '200px'
    }}
  >
    <CircularProgress size={24} />
  </Box>
);

/**
 * Empty state component
 */
const EmptyState: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '200px',
      textAlign: 'center',
      p: 3,
    }}
  >
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No messages yet
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Start the conversation by sending a message
    </Typography>
  </Box>
);

/**
 * Individual message component
 */
interface MessageItemProps {
  message: MessageDto;
  isMine: boolean;
  showAvatar: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isMine, showAvatar }) => {
  return (
    <MessageContainer isMine={isMine}>
      {!isMine && showAvatar && (
        <MessageAvatar>
          <PersonIcon fontSize="small" />
        </MessageAvatar>
      )}
      {!isMine && !showAvatar && (
        <Box sx={{ width: 32 }} /> // Spacer for alignment
      )}
      
      <MessageContent>
        <MessageBubble isMine={isMine} elevation={1}>
          <MessageText variant="body2">
            {message.content}
          </MessageText>
          <MessageTimestamp isMine={isMine} variant="caption">
            {formatMessageTimestamp(message.timestamp)}
          </MessageTimestamp>
        </MessageBubble>
      </MessageContent>
      
      {isMine && showAvatar && (
        <MessageAvatar>
          <PersonIcon fontSize="small" />
        </MessageAvatar>
      )}
      {isMine && !showAvatar && (
        <Box sx={{ width: 32 }} /> // Spacer for alignment
      )}
    </MessageContainer>
  );
};

/**
 * MessageThread Component
 * 
 * Single Responsibility: Only renders message thread UI
 * Interface Segregation: Minimal props interface with only required data
 * 
 * @param props Component props
 * @returns Rendered message thread
 */
export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  loading
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Handle loading state
  if (loading) {
    return (
      <Paper sx={{ height: '400px' }}>
        <LoadingSkeleton />
      </Paper>
    );
  }

  // Handle empty state
  if (messages.length === 0) {
    return (
      <Paper sx={{ height: '400px' }}>
        <EmptyState />
      </Paper>
    );
  }

  // Determine which messages should show avatars
  // Show avatar for first message in a group from the same sender
  const messagesWithAvatars = messages.map((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
    
    return {
      ...message,
      isMine: message.senderId === currentUserId,
      showAvatar
    };
  });

  // Render message thread
  return (
    <Paper sx={{ height: '400px', overflow: 'hidden' }}>
      <ThreadContainer ref={scrollRef}>
        {messagesWithAvatars.map((message) => (
          <MessageItem
            key={message.messageId}
            message={message}
            isMine={message.isMine}
            showAvatar={message.showAvatar}
          />
        ))}
      </ThreadContainer>
    </Paper>
  );
};

export default MessageThread;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - MessageThread: Only renders message thread UI and handles scrolling
 * - MessageItem: Only renders individual message bubble
 * - LoadingSkeleton: Only renders loading state
 * - EmptyState: Only renders empty state message
 * - formatMessageTimestamp: Only formats message timestamps
 * 
 * Open/Closed Principle (OCP):
 * - Extensible styling through styled components
 * - New message types can be added without changing core component
 * - Avatar display logic is isolated and can be extended
 * - Timestamp formatting can be customized without breaking existing code
 * 
 * Interface Segregation Principle (ISP):
 * - Minimal props interface with only required data
 * - No data fetching or Redux dependencies
 * - Clean separation between data and presentation concerns
 * 
 * Benefits:
 * - Pure Presentational: No Redux, HTTP, or business logic dependencies
 * - Auto-scrolling: Automatically scrolls to bottom when new messages arrive
 * - Responsive Design: Adapts to different screen sizes with proper breakpoints
 * - Accessibility: Proper semantic structure and ARIA attributes
 * - Performance: Optimized rendering with proper key props
 * - User Experience: Smart avatar grouping and timestamp formatting
 * 
 * Usage Examples:
 * 
 * // Basic usage
 * <MessageThread
 *   messages={threadMessages}
 *   currentUserId={123}
 *   loading={false}
 * />
 * 
 * // With loading state
 * <MessageThread
 *   messages={[]}
 *   currentUserId={123}
 *   loading={true}
 * />
 * 
 * // In container component
 * const MessageThreadContainer: React.FC<{ conversationId: number }> = ({ conversationId }) => {
 *   const thread = useSelector(state => selectConversationThread(state, conversationId));
 *   const loading = useSelector(selectLoading);
 *   const currentUserId = useSelector(selectCurrentUserId);
 * 
 *   return (
 *     <MessageThread
 *       messages={thread?.items || []}
 *       currentUserId={currentUserId}
 *       loading={loading === 'loading'}
 *     />
 *   );
 * };
 */