/**
 * ItemDetailActionsContainer
 * 
 * Container component that connects ItemDetailActions to Redux state following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles Redux integration for messaging
 * - Dependency Inversion Principle (DIP): Uses Redux thunks instead of direct service imports
 * 
 * Container pattern separating business logic from presentation
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ItemDetailActions } from './ItemDetailActions';
import type { AppDispatch } from '../../../store/store';
import { selectAuthUser } from '../../../store/authSlice';
import { startConversationThunk } from '../../../store/messagingSlice';
import type { ItemDetail } from '../../../domain/items/contracts';

/**
 * Container props interface
 */
interface ItemDetailActionsContainerProps {
  /** Item data for actions */
  item: ItemDetail;
}

/**
 * ItemDetailActionsContainer Component
 * 
 * Single Responsibility: Orchestrates messaging actions with Redux integration
 * Dependency Inversion: Uses Redux thunks instead of direct service calls
 * 
 * Features:
 * - Integrates with Redux messaging state
 * - Handles conversation creation
 * - Navigates to created conversation
 * - Manages loading states during async operations
 * 
 * @param props Container props
 * @returns Rendered item actions with Redux integration
 */
export const ItemDetailActionsContainer: React.FC<ItemDetailActionsContainerProps> = ({
  item
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Local state for messaging loading
  const [isMessaging, setIsMessaging] = useState(false);
  
  // Select current user from Redux state (DIP: no direct auth service dependencies)
  const currentUser = useSelector(selectAuthUser);

  /**
   * Handle message seller action with Redux integration
   * DIP: Uses thunk instead of direct service call
   */
  const handleMessageSeller = async (itemId: number, sellerId: number) => {
    if (!currentUser) {
      // User should be authenticated to message sellers
      console.warn('User must be authenticated to message sellers');
      return;
    }

    try {
      setIsMessaging(true);
      
      // Start conversation via Redux thunk (DIP: no direct messaging service import)
      const result = await dispatch(startConversationThunk({
        itemId,
        otherUserId: sellerId
      }));

      // Check if conversation creation was successful
      if (startConversationThunk.fulfilled.match(result)) {
        const conversationId = result.payload;
        
        // Navigate to the new conversation
        navigate(`/inbox/${conversationId}`);
      } else {
        // Handle failure case
        console.error('Failed to start conversation:', result.error?.message);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error starting conversation:', error);
    } finally {
      setIsMessaging(false);
    }
  };

  return (
    <ItemDetailActions
      item={item}
      currentUserId={currentUser?.userId}
      onMessageSeller={handleMessageSeller}
      isMessaging={isMessaging}
    />
  );
};

export default ItemDetailActionsContainer;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - ItemDetailActionsContainer: Only handles Redux integration for messaging
 * - handleMessageSeller: Only handles conversation creation and navigation
 * - State management: Isolated loading state for messaging operations
 * 
 * Open/Closed Principle (OCP):
 * - Extensible through additional Redux actions without changing core logic
 * - Navigation logic can be enhanced without modifying messaging logic
 * - Error handling can be customized through additional thunk handling
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on Redux abstractions (thunks) instead of concrete services
 * - No direct messaging service or auth service imports
 * - All data access through Redux state management
 * - Testable through Redux store mocking
 * 
 * Benefits:
 * - Pure Container Pattern: Only orchestrates state and business logic
 * - Redux Integration: Seamless integration with messaging state management
 * - Navigation Integration: Automatic routing to created conversations
 * - Error Handling: Comprehensive error handling for async operations
 * - Loading States: Proper loading feedback during conversation creation
 * - Authentication Awareness: Checks user authentication before messaging
 * - Type Safety: Full TypeScript support with Redux types
 * 
 * Usage Examples:
 * 
 * // In item detail page
 * const ItemDetailPage: React.FC = () => {
 *   const { itemId } = useParams();
 *   const [item, setItem] = useState<ItemDetail | null>(null);
 * 
 *   useEffect(() => {
 *     // Fetch item details
 *     fetchItemDetails(itemId).then(setItem);
 *   }, [itemId]);
 * 
 *   if (!item) return <Loading />;
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
 * // Route configuration
 * <Route path="/items/:itemId" element={<ItemDetailPage />} />
 * 
 * // Testing approach
 * const mockStore = createMockStore({
 *   auth: {
 *     user: { userId: 123, email: 'test@example.com' }
 *   },
 *   messaging: {
 *     loading: 'idle',
 *     error: undefined
 *   }
 * });
 * 
 * const mockItem: ItemDetail = {
 *   itemId: 456,
 *   title: 'Test Item',
 *   sellerId: 789,
 *   statusId: 2,
 *   price: 100,
 *   // ... other properties
 * };
 * 
 * render(
 *   <Provider store={mockStore}>
 *     <BrowserRouter>
 *       <ItemDetailActionsContainer item={mockItem} />
 *     </BrowserRouter>
 *   </Provider>
 * );
 * 
 * // Integration with Redux DevTools
 * const ItemDetailWithDevTools = () => (
 *   <Provider store={store}>
 *     <BrowserRouter>
 *       <ItemDetailPage />
 *     </BrowserRouter>
 *   </Provider>
 * );
 */