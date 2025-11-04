/**
 * InboxList Presentational Component
 * 
 * Displays a list of conversation items following SOLID principles:
 * - Single Responsibility Principle (SRP): Only renders conversation list UI
 * - Interface Segregation Principle (ISP): Minimal, focused props interface
 * 
 * Pure presentational component with no business logic, Redux, or HTTP dependencies
 */

import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box,
  CircularProgress,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import type { ConversationListItem } from '../../../domain/messaging/contracts';

/**
 * Component props following ISP - only what's needed for rendering
 */
interface InboxListProps {
  /** Array of conversation items to display */
  items: ConversationListItem[];
  /** Callback when user clicks on a conversation */
  onOpen: (conversationId: number) => void;
  /** Loading state for skeleton/spinner display */
  loading: boolean;
}

/**
 * Styled components for consistent design
 */
const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const UnreadBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: '0.75rem',
    height: '20px',
    minWidth: '20px',
  },
}));

const LastMessageText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}));

const TimestampText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  whiteSpace: 'nowrap',
}));

/**
 * Format timestamp for display
 * @param timestamp ISO timestamp string
 * @returns Formatted time string
 */
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
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
      p: 4,
      textAlign: 'center',
    }}
  >
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No conversations yet
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Start a conversation by messaging someone about an item
    </Typography>
  </Box>
);

/**
 * Individual conversation item component
 */
interface ConversationItemProps {
  item: ConversationListItem;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ item, onClick }) => {
  const hasUnread = item.unreadCount && item.unreadCount > 0;
  const unreadCount = item.unreadCount || 0;

  return (
    <StyledListItem disablePadding>
      <StyledListItemButton onClick={onClick}>
        <ListItemAvatar>
          <UnreadBadge
            badgeContent={hasUnread ? (unreadCount > 99 ? '99+' : unreadCount) : 0}
            invisible={!hasUnread}
          >
            <Avatar>
              <PersonIcon />
            </Avatar>
          </UnreadBadge>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: hasUnread ? 600 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  mr: 1,
                }}
              >
                {item.otherUserName}
              </Typography>
              <TimestampText>
                {formatTimestamp(item.lastUpdated)}
              </TimestampText>
            </Box>
          }
          secondary={
            item.lastMessage ? (
              <LastMessageText variant="body2">
                {item.lastMessage}
              </LastMessageText>
            ) : (
              <LastMessageText variant="body2" sx={{ fontStyle: 'italic' }}>
                No messages yet
              </LastMessageText>
            )
          }
        />
      </StyledListItemButton>
    </StyledListItem>
  );
};

/**
 * InboxList Component
 * 
 * Single Responsibility: Only renders conversation list UI
 * Interface Segregation: Minimal props interface with only required data
 * 
 * @param props Component props
 * @returns Rendered conversation list
 */
export const InboxList: React.FC<InboxListProps> = ({
  items,
  onOpen,
  loading
}) => {
  // Handle loading state
  if (loading) {
    return (
      <Paper sx={{ mt: 2 }}>
        <LoadingSkeleton />
      </Paper>
    );
  }

  // Handle empty state
  if (items.length === 0) {
    return (
      <Paper sx={{ mt: 2 }}>
        <EmptyState />
      </Paper>
    );
  }

  // Render conversation list
  return (
    <Paper sx={{ mt: 2 }}>
      <List disablePadding>
        {items.map((item) => (
          <ConversationItem
            key={item.conversationId}
            item={item}
            onClick={() => onOpen(item.conversationId)}
          />
        ))}
      </List>
    </Paper>
  );
};

export default InboxList;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - InboxList: Only renders conversation list UI
 * - ConversationItem: Only renders individual conversation row
 * - LoadingSkeleton: Only renders loading state
 * - EmptyState: Only renders empty state message
 * - formatTimestamp: Only formats time display
 * 
 * Open/Closed Principle (OCP):
 * - Extensible styling through styled components
 * - New conversation item features can be added without changing core component
 * - Timestamp formatting can be extended without breaking existing code
 * 
 * Interface Segregation Principle (ISP):
 * - Minimal props interface with only required data
 * - No unnecessary props or dependencies
 * - Clean separation between data and presentation concerns
 * 
 * Benefits:
 * - Pure Presentational: No Redux, HTTP, or business logic dependencies
 * - Reusable: Can be used in different contexts with different data sources
 * - Testable: Easy to test with mock data and event handlers
 * - Accessible: Proper ARIA attributes and semantic HTML structure
 * - Responsive: Material-UI components adapt to different screen sizes
 * - Performance: Optimized rendering with proper key props and memoization opportunities
 * 
 * Usage Examples:
 * 
 * // Basic usage
 * <InboxList
 *   items={conversations}
 *   onOpen={(conversationId) => navigate(`/messages/${conversationId}`)}
 *   loading={false}
 * />
 * 
 * // With loading state
 * <InboxList
 *   items={[]}
 *   onOpen={() => {}}
 *   loading={true}
 * />
 * 
 * // In container component
 * const MessagingInboxContainer: React.FC = () => {
 *   const inbox = useSelector(selectInbox);
 *   const loading = useSelector(selectLoading);
 *   const navigate = useNavigate();
 * 
 *   const handleOpenConversation = (conversationId: number) => {
 *     navigate(`/messages/${conversationId}`);
 *   };
 * 
 *   return (
 *     <InboxList
 *       items={inbox?.items || []}
 *       onOpen={handleOpenConversation}
 *       loading={loading === 'loading'}
 *     />
 *   );
 * };
 */