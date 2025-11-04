/**
 * ItemDetailActions Component
 * 
 * Presentational component for item detail page actions following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles action UI rendering
 * - Interface Segregation Principle (ISP): Minimal, focused props interface
 * 
 * Pure presentational component with container pattern separation
 */

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Typography,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MessageIcon from '@mui/icons-material/Message';
import type { ItemDetail } from '../../../domain/items/contracts';

/**
 * Component props following ISP - only what's needed for action rendering
 */
interface ItemDetailActionsProps {
  /** Item data for action context */
  item: ItemDetail;
  /** Current user ID for ownership checks */
  currentUserId?: number;
  /** Callback when user wants to message the seller */
  onMessageSeller: (itemId: number, sellerId: number) => void;
  /** Whether messaging action is currently loading */
  isMessaging?: boolean;
}

/**
 * Styled components for actions layout
 */
const ActionsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(2),
}));

const ActionSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const PriceSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const StatusChip = styled(Chip)(() => ({
  fontWeight: 'bold',
}));

const MessageButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontWeight: 'bold',
  padding: theme.spacing(1.5, 3),
}));

/**
 * Get status display information
 */
const getStatusInfo = (statusId: number) => {
  switch (statusId) {
    case 1: // Draft
      return { label: 'Draft', color: 'default' as const };
    case 2: // Active
      return { label: 'Available', color: 'success' as const };
    case 3: // Sold
      return { label: 'Sold', color: 'error' as const };
    case 4: // Removed
      return { label: 'Removed', color: 'default' as const };
    case 5: // Flagged
      return { label: 'Flagged', color: 'warning' as const };
    default:
      return { label: 'Unknown', color: 'default' as const };
  }
};

/**
 * ItemDetailActions Component
 * 
 * Single Responsibility: Only renders item action UI
 * Interface Segregation: Minimal props focused on action display
 * 
 * Features:
 * - Message Seller button with loading state
 * - Item status and price display
 * - Ownership-based action visibility
 * - Responsive action layout
 * 
 * @param props Component props
 * @returns Rendered item actions
 */
export const ItemDetailActions: React.FC<ItemDetailActionsProps> = ({
  item,
  currentUserId,
  onMessageSeller,
  isMessaging = false
}) => {
  // Check if current user owns this item
  const isOwnItem = currentUserId === item.sellerId;
  
  // Get status information
  const statusInfo = getStatusInfo(item.statusId);
  
  // Check if item is available for messaging
  const isAvailable = item.statusId === 2; // Active status
  
  /**
   * Handle message seller action
   */
  const handleMessageSeller = () => {
    if (!isOwnItem && isAvailable && !isMessaging) {
      onMessageSeller(item.itemId, item.sellerId);
    }
  };

  return (
    <ActionsContainer elevation={2}>
      <ActionSection>
        {/* Price and Status */}
        <PriceSection>
          <Box>
            {item.price !== undefined && (
              <Typography variant="h4" color="primary" fontWeight="bold">
                ${item.price.toFixed(2)}
              </Typography>
            )}
          </Box>
          
          <StatusChip 
            label={statusInfo.label} 
            color={statusInfo.color}
            size="medium"
          />
        </PriceSection>

        {/* Message Seller Action */}
        {!isOwnItem && (
          <Box>
            <MessageButton
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<MessageIcon />}
              onClick={handleMessageSeller}
              disabled={!isAvailable || isMessaging}
              aria-label={isMessaging ? 'Starting conversation...' : 'Message seller'}
            >
              {isMessaging 
                ? 'Starting conversation...' 
                : isAvailable 
                  ? 'Message Seller' 
                  : 'Not Available'
              }
            </MessageButton>

            {!isAvailable && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                textAlign="center"
                sx={{ mt: 1 }}
              >
                This item is no longer available for purchase
              </Typography>
            )}
          </Box>
        )}

        {/* Own Item Message */}
        {isOwnItem && (
          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
              This is your listing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You cannot message yourself about this item
            </Typography>
          </Box>
        )}

        {/* Item Info */}
        <Box>
          <Typography variant="body2" color="text.secondary">
            Posted on {new Date(item.postedDate).toLocaleDateString()}
          </Typography>
          
          {item.categoryName && (
            <Typography variant="body2" color="text.secondary">
              Category: {item.categoryName}
            </Typography>
          )}
        </Box>
      </ActionSection>
    </ActionsContainer>
  );
};

export default ItemDetailActions;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - ItemDetailActions: Only handles action UI rendering
 * - handleMessageSeller: Only handles button click logic
 * - getStatusInfo: Only handles status display logic
 * - Status display logic is isolated and focused
 * 
 * Open/Closed Principle (OCP):
 * - Easy to extend with new action types without modifying core component
 * - Status handling can be extended with new status types
 * - Button variants can be customized through props
 * - Styling is extensible through styled components
 * 
 * Interface Segregation Principle (ISP):
 * - Minimal props interface with only required functionality
 * - No Redux, HTTP, or business logic dependencies
 * - Clean separation between presentation and container logic
 * - Focused on action display without unrelated concerns
 * 
 * Benefits:
 * - Pure Presentational: No Redux, HTTP, or business logic dependencies
 * - Ownership Logic: Smart handling of own vs. other user items
 * - Status Awareness: Contextual actions based on item availability
 * - Loading States: Proper feedback during async operations
 * - Accessibility: ARIA labels and keyboard navigation
 * - Responsive Design: Material-UI responsive layout
 * - Type Safety: Full TypeScript support with item contracts
 * 
 * Usage Examples:
 * 
 * // Basic usage in item detail page
 * <ItemDetailActions
 *   item={itemDetail}
 *   currentUserId={currentUser?.userId}
 *   onMessageSeller={handleMessageSeller}
 *   isMessaging={isStartingConversation}
 * />
 * 
 * // In container component
 * const ItemDetailActionsContainer: React.FC<{ item: ItemDetail }> = ({ item }) => {
 *   const dispatch = useAppDispatch();
 *   const navigate = useNavigate();
 *   const currentUser = useSelector(selectAuthUser);
 *   const [isMessaging, setIsMessaging] = useState(false);
 * 
 *   const handleMessageSeller = async (itemId: number, sellerId: number) => {
 *     try {
 *       setIsMessaging(true);
 *       
 *       // Start conversation via Redux thunk
 *       const result = await dispatch(startConversationThunk({
 *         itemId,
 *         otherUserId: sellerId
 *       }));
 * 
 *       if (startConversationThunk.fulfilled.match(result)) {
 *         const conversationId = result.payload;
 *         navigate(`/inbox/${conversationId}`);
 *       }
 *     } catch (error) {
 *       console.error('Failed to start conversation:', error);
 *     } finally {
 *       setIsMessaging(false);
 *     }
 *   };
 * 
 *   return (
 *     <ItemDetailActions
 *       item={item}
 *       currentUserId={currentUser?.userId}
 *       onMessageSeller={handleMessageSeller}
 *       isMessaging={isMessaging}
 *     />
 *   );
 * };
 * 
 * // Integration with item detail page
 * const ItemDetailPage: React.FC = () => {
 *   const { itemId } = useParams();
 *   const [item, setItem] = useState<ItemDetail | null>(null);
 * 
 *   // ... fetch item logic
 * 
 *   return (
 *     <Container>
 *       <ItemImages images={item.images} />
 *       <ItemDescription item={item} />
 *       <ItemDetailActionsContainer item={item} />
 *     </Container>
 *   );
 * };
 * 
 * // Testing approach
 * const mockItem: ItemDetail = {
 *   itemId: 123,
 *   title: 'Test Item',
 *   description: 'Test description',
 *   price: 100,
 *   statusId: 2, // Available
 *   sellerId: 456,
 *   postedDate: '2023-01-01T00:00:00Z',
 *   images: []
 * };
 * 
 * const mockMessageSeller = jest.fn();
 * 
 * render(
 *   <ItemDetailActions
 *     item={mockItem}
 *     currentUserId={789} // Different from seller
 *     onMessageSeller={mockMessageSeller}
 *     isMessaging={false}
 *   />
 * );
 */