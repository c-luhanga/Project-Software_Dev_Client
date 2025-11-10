/**
 * Inbox Page Container
 *
 * Container component that connects messaging state to presentation following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles inbox page orchestration
 * - Dependency Inversion Principle (DIP): Uses Redux thunks instead of direct repository imports
 *
 * Pure container pattern with no business logic or infrastructure dependencies
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import type { AppDispatch } from '../../../store/store';
import {
  fetchInboxThunk,
  selectInbox,
  selectMessagingStatus,
  clearError
} from '../../../store/messagingSlice';
import { 
  webSocketActions, 
  selectWebSocketConnected, 
  selectWebSocketConnecting 
} from '../../../store/webSocketSlice';
import { InboxList } from '../../components/messaging/InboxList';

/**
 * Styled components for inbox page layout
 */
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const InboxHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

/**
 * InboxPage Container Component
 * 
 * Single Responsibility: Orchestrates inbox display and navigation
 * Dependency Inversion: Uses Redux thunks instead of direct service imports
 * 
 * Features:
 * - Auto-fetches inbox on mount
 * - Handles loading and error states
 * - Navigates to individual conversations
 * - Error display and dismissal
 * 
 * @returns Rendered inbox page
 */
export const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Select state from Redux store (DIP: no direct service dependencies)
  const inbox = useSelector(selectInbox);
  const { loading, error } = useSelector(selectMessagingStatus);
  const wsConnected = useSelector(selectWebSocketConnected);
  const wsConnecting = useSelector(selectWebSocketConnecting);

  /**
   * Fetch inbox data and connect to WebSocket
   * DIP: Uses thunk instead of direct repository call
   */
  // Helper to fetch inbox and update lastUpdated on success
  const doFetch = useCallback(() => {
    return dispatch(fetchInboxThunk({ page: 1, pageSize: 20 }) as any).then((res: any) => {
      if (fetchInboxThunk.fulfilled.match(res)) {
        setLastUpdated(new Date().toISOString());
      }
      return res;
    });
  }, [dispatch]);

  useEffect(() => {
    // Fetch initial data
    doFetch();
    
    // Connect to WebSocket for real-time updates
    dispatch(webSocketActions.connect());
  }, [doFetch, dispatch]);

  /**
   * Handle conversation selection
   * Navigates to individual chat page
   */
  const handleConversationOpen = (conversationId: number) => {
    navigate(`/inbox/${conversationId}`);
  };

  /**
   * Handle error dismissal
   */
  const handleErrorDismiss = () => {
    dispatch(clearError());
  };

  /**
   * Manual refresh handler (also updates lastUpdated)
   */
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh requested');
    doFetch();
  };

  /**
   * Check if we have conversations to display
   */
  const hasConversations = inbox && inbox.items.length > 0;
  const isLoading = loading === 'loading';
  const hasError = !!error;

  return (
    <PageContainer maxWidth="md">
      <InboxHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Messages
          </Typography>
          {hasConversations && (
            <Typography variant="body2" color="text.secondary">
              {inbox.total} conversation{inbox.total !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </Typography>
          )}
          
          {/* WebSocket connection status */}
          <Chip 
            label={wsConnected ? 'Live' : wsConnecting ? 'Connecting...' : 'Offline'} 
            color={wsConnected ? 'success' : wsConnecting ? 'warning' : 'default'}
            size="small"
            variant="outlined"
          />
          
          <Tooltip title="Refresh inbox">
            <IconButton onClick={handleManualRefresh} aria-label="Refresh inbox">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </InboxHeader>

      {/* Error Alert */}
      {hasError && (
        <Alert 
          severity="error" 
          onClose={handleErrorDismiss}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', backgroundColor: '#ffffff', borderRadius: 2 }}>
        <InboxList
          items={inbox?.items || []}
          loading={isLoading}
          onOpen={handleConversationOpen}
        />
      </Box>
    </PageContainer>
  );
};

export default InboxPage;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - InboxPage: Only handles inbox page orchestration and navigation
 * - handleConversationSelect: Only handles navigation logic
 * - handleErrorDismiss: Only handles error dismissal
 * - State selection: Isolated to specific selectors
 * 
 * Open/Closed Principle (OCP):
 * - Extensible through additional Redux state without changing component
 * - Navigation logic can be extended without modifying core functionality
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
 * - No Business Logic: All effects handled in thunks
 * - Type Safety: Full TypeScript support with Redux types
 * - Navigation Integration: React Router for conversation routing
 * - Error Handling: Comprehensive error display and dismissal
 * - Loading States: Proper loading feedback during data fetching
 * - Empty States: User-friendly messaging when no conversations exist
 * - Responsive Design: Material-UI responsive layout
 * 
 * Usage Examples:
 * 
 * // Route configuration
 * <Route path="/inbox" element={<InboxPage />} />
 * 
 * // Navigation from other components
 * const navigate = useNavigate();
 * navigate('/inbox');
 * 
 * // Testing approach
 * const mockStore = createMockStore({
 *   messaging: {
 *     inbox: { items: mockConversations, total: 2 },
 *     loading: 'succeeded',
 *     error: undefined
 *   }
 * });
 * 
 * render(
 *   <Provider store={mockStore}>
 *     <BrowserRouter>
 *       <InboxPage />
 *     </BrowserRouter>
 *   </Provider>
 * );
 * 
 * // Redux integration
 * export const InboxPageContainer = () => (
 *   <Provider store={store}>
 *     <BrowserRouter>
 *       <InboxPage />
 *     </BrowserRouter>
 *   </Provider>
 * );
 */