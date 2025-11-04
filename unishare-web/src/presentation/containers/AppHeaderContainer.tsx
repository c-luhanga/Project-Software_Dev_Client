/**
 * App Header Container Component
 * 
 * Container component following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles header state/navigation integration
 * - Dependency Inversion Principle (DIP): Uses Redux thunks and navigation abstractions
 * 
 * Architecture Pattern:
 * - Container component that bridges Redux state and presentational UI
 * - No direct service or repository imports (follows DIP)
 * - Uses Redux selectors for state access
 * - Uses React Router for navigation
 * - Delegates all UI concerns to AppBarShell presentational component
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store/store';
import { logoutThunk, selectIsAdmin } from '../../store/authSlice';
import { AppBarShell } from '../components/shell/AppBarShell';

/**
 * AppHeaderContainer - Container component for app header
 * 
 * Responsibilities:
 * - Connect Redux state to presentational AppBarShell component
 * - Handle navigation actions through React Router
 * - Dispatch authentication-related actions
 * - Calculate derived state (unread message count)
 * - Provide clean separation between state management and UI
 * 
 * State Selection:
 * - Authentication state from auth slice
 * - User profile data from auth slice
 * - Unread message count from messaging slice (derived state)
 * 
 * Navigation Handlers:
 * - Home navigation (/)
 * - Sell item navigation (/items/sell) - protected route handles auth
 * - Authentication navigation (/login, /register)
 * - Profile navigation (/profile)
 * - Inbox navigation (/inbox)
 * - Logout with navigation to login
 * 
 * @returns Rendered app header with connected state and navigation
 */
export const AppHeaderContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Select authentication state
  const isAuthenticated = useSelector((state: RootState) => 
    Boolean(state.auth.token && state.auth.user)
  );
  
  // Select user profile data
  const profile = useSelector((state: RootState) => {
    const user = state.auth.user;
    if (!user) return undefined;
    
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl
    };
  });

  // Select admin status
  const isAdmin = useSelector(selectIsAdmin);

  // Calculate unread message count from messaging state
  const unreadCount = useSelector((state: RootState) => {
    // Check if messaging state exists and has inbox data
    if (!state.messaging?.inbox?.items) {
      return 0;
    }

    // Sum unread counts across all conversations
    return state.messaging.inbox.items.reduce((total, conversation) => {
      return total + (conversation.unreadCount || 0);
    }, 0);
  });

  /**
   * Navigation handler: Go to home page
   */
  const handleGoHome = () => {
    navigate('/');
  };

  /**
   * Navigation handler: Go to sell item page
   * Note: Protected route will handle authentication requirements
   */
  const handleGoSell = () => {
    navigate('/items/sell');
  };

  /**
   * Navigation handler: Go to login page
   */
  const handleGoLogin = () => {
    navigate('/login');
  };

  /**
   * Navigation handler: Go to register page
   */
  const handleGoRegister = () => {
    navigate('/register');
  };

  /**
   * Navigation handler: Go to user profile page
   */
  const handleOpenProfile = () => {
    navigate('/profile');
  };

  /**
   * Navigation handler: Go to inbox page
   */
  const handleOpenInbox = () => {
    navigate('/inbox');
  };

  /**
   * Navigation handler: Go to admin panel
   */
  const handleOpenAdmin = () => {
    navigate('/admin');
  };

  /**
   * Authentication handler: Logout user and redirect to login
   * Uses Redux thunk for logout action, then navigates to login page
   */
  const handleLogout = async () => {
    try {
      // Dispatch logout thunk (handles token cleanup, API calls, etc.)
      await dispatch(logoutThunk());
      
      // Navigate to login page after logout
      navigate('/login');
    } catch (error) {
      // If logout fails, still navigate to login for security
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <AppBarShell
      isAuthenticated={isAuthenticated}
      profile={profile}
      unreadCount={unreadCount > 0 ? unreadCount : undefined}
      isAdmin={isAdmin}
      onGoHome={handleGoHome}
      onGoSell={handleGoSell}
      onGoLogin={handleGoLogin}
      onGoRegister={handleGoRegister}
      onOpenProfile={handleOpenProfile}
      onOpenInbox={handleOpenInbox}
      onOpenAdmin={handleOpenAdmin}
      onLogout={handleLogout}
    />
  );
};

/**
 * Default export for easier importing
 */
export default AppHeaderContainer;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - AppHeaderContainer: Only handles header state integration and navigation
 * - Each handler function: Only handles a specific navigation or action concern
 * - State selectors: Each focuses on a specific piece of state
 * - No UI rendering logic (delegated to AppBarShell)
 * - No business logic (delegated to Redux thunks and services)
 * 
 * Open/Closed Principle (OCP):
 * - Container is closed for modification but open for extension
 * - New navigation handlers can be added without changing existing code
 * - State selection can be extended without breaking existing functionality
 * - AppBarShell interface changes don't require container restructuring
 * 
 * Liskov Substitution Principle (LSP):
 * - Can be used anywhere an app header container is needed
 * - Maintains consistent behavior across different application contexts
 * - Props passed to AppBarShell maintain expected contracts
 * 
 * Interface Segregation Principle (ISP):
 * - Container only depends on specific Redux state slices it needs
 * - No unnecessary dependencies on unused state or actions
 * - Clean separation between state selection and UI concerns
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on Redux abstractions (useSelector, useDispatch) not concrete stores
 * - Depends on React Router abstractions (useNavigate) not concrete routing
 * - Uses logout thunk abstraction instead of direct service calls
 * - No direct imports of repositories, API clients, or business services
 * - All dependencies are injected through React/Redux hooks
 * 
 * Benefits:
 * - Clear Separation: State management separate from UI rendering
 * - Testability: Easy to mock Redux state and navigation for testing
 * - Maintainability: Changes to state structure don't affect UI components
 * - Reusability: AppBarShell can be used with different state sources
 * - Type Safety: Full TypeScript support with proper state typing
 * - Performance: Efficient state selection with minimal re-renders
 * - Scalability: Easy to add new state sources or navigation targets
 * - Framework Independence: UI component has no Redux dependencies
 * 
 * Usage Examples:
 * 
 * // Basic usage in app layout
 * const AppLayout = () => {
 *   return (
 *     <div>
 *       <AppHeaderContainer />
 *       <main>
 *         <Outlet />
 *       </main>
 *     </div>
 *   );
 * };
 * 
 * // Usage in router configuration
 * const router = createBrowserRouter([
 *   {
 *     path: "/",
 *     element: (
 *       <div>
 *         <AppHeaderContainer />
 *         <HomePage />
 *       </div>
 *     )
 *   }
 * ]);
 * 
 * // Testing example
 * describe('AppHeaderContainer', () => {
 *   const mockStore = configureStore({
 *     reducer: {
 *       auth: authSlice.reducer,
 *       messaging: messagingSlice.reducer
 *     },
 *     preloadedState: {
 *       auth: {
 *         isAuthenticated: true,
 *         user: { firstName: 'John', lastName: 'Doe' }
 *       },
 *       messaging: {
 *         inbox: {
 *           items: [
 *             { conversationId: 1, unreadCount: 2 },
 *             { conversationId: 2, unreadCount: 1 }
 *           ]
 *         }
 *       }
 *     }
 *   });
 * 
 *   test('should calculate unread count correctly', () => {
 *     render(
 *       <Provider store={mockStore}>
 *         <BrowserRouter>
 *           <AppHeaderContainer />
 *         </BrowserRouter>
 *       </Provider>
 *     );
 *     
 *     // Should show total unread count of 3
 *     expect(screen.getByText('3')).toBeInTheDocument();
 *   });
 * 
 *   test('should dispatch logout when logout clicked', async () => {
 *     const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
 *     
 *     render(
 *       <Provider store={mockStore}>
 *         <BrowserRouter>
 *           <AppHeaderContainer />
 *         </BrowserRouter>
 *       </Provider>
 *     );
 *     
 *     // Click avatar menu and logout
 *     fireEvent.click(screen.getByLabelText('Account menu'));
 *     fireEvent.click(screen.getByText('Logout'));
 *     
 *     expect(dispatchSpy).toHaveBeenCalledWith(logout());
 *   });
 * });
 * 
 * State Flow Examples:
 * 
 * // Authentication state flow
 * Initial: { isAuthenticated: false, user: null }
 * After login: { isAuthenticated: true, user: { firstName: 'John', ... } }
 * Container selects: isAuthenticated=true, profile={ firstName: 'John', ... }
 * AppBarShell renders: Authenticated UI with user avatar
 * 
 * // Messaging state flow
 * Initial: { messaging: { inbox: { items: [] } } }
 * After messages: { messaging: { inbox: { items: [{ unreadCount: 2 }, { unreadCount: 1 }] } } }
 * Container calculates: unreadCount = 3
 * AppBarShell renders: Badge with "3" on avatar and inbox icon
 * 
 * // Navigation flow
 * User clicks "Sell Item" -> handleGoSell() -> navigate('/items/sell')
 * Protected route checks auth -> If authenticated: renders sell page
 * If not authenticated: redirects to login with return URL
 * 
 * // Logout flow
 * User clicks "Logout" -> handleLogout() -> dispatch(logout())
 * Logout thunk: clears tokens, calls API, updates state
 * Container: navigate('/login') after successful logout
 * Result: User on login page, authentication state cleared
 */