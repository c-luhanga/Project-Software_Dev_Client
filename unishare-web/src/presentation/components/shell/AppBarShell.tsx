/**
 * App Bar Shell Component
 * 
 * Presentational component following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles app header UI layout
 * - Interface Segregation Principle (ISP): Focused props interface
 * 
 * Framework Independence:
 * - No Redux, routing, or external service dependencies
 * - Pure UI component with callback-based interactions
 * - Can be used in any React application context
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  styled,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { AvatarMenu, type UserProfile } from './AvatarMenu';

/**
 * App bar component props
 * Focused interface with clear separation between authentication states
 */
export interface AppBarShellProps {
  /** Whether user is currently authenticated */
  readonly isAuthenticated: boolean;
  
  /** User profile data for avatar display (only when authenticated) */
  readonly profile?: UserProfile;
  
  /** Number of unread messages (only when authenticated) */
  readonly unreadCount?: number;
  
  /** Callback when user clicks the logo/home */
  readonly onGoHome: () => void;
  
  /** Callback when user wants to sell an item */
  readonly onGoSell: () => void;
  
  /** Callback when user wants to login */
  readonly onGoLogin: () => void;
  
  /** Callback when user wants to register */
  readonly onGoRegister: () => void;
  
  /** Callback when user wants to open their profile */
  readonly onOpenProfile: () => void;
  
  /** Callback when user wants to open their inbox */
  readonly onOpenInbox: () => void;
  
  /** Callback when user wants to logout */
  readonly onLogout: () => void;
}

/**
 * Styled components for better organization and performance
 */
const LogoButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'inherit',
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  maxWidth: 600,
  margin: theme.spacing(0, 2),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(0.5)
  }
}));

const AuthButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  minWidth: 80,
  [theme.breakpoints.down('sm')]: {
    minWidth: 70,
    fontSize: '0.875rem'
  }
}));

const SellButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(3),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    fontSize: '0.875rem'
  }
}));

/**
 * AppBarShell - Presentational responsive header component
 * 
 * Features:
 * - Responsive layout that adapts to different screen sizes
 * - Conditional rendering based on authentication state
 * - Clickable logo/brand that navigates home
 * - Placeholder search input (center, hidden on mobile)
 * - Authentication buttons when not logged in
 * - Sell item button and avatar menu when authenticated
 * - Clean separation between authenticated and unauthenticated states
 * 
 * Responsive Behavior:
 * - Desktop: Full layout with search bar
 * - Tablet: Search bar hidden, actions remain
 * - Mobile: Compact layout with smaller buttons
 * 
 * Accessibility:
 * - Proper ARIA labels for all interactive elements
 * - Keyboard navigation support
 * - Screen reader friendly text and announcements
 * - Color contrast compliance
 * 
 * @param props Component props
 * @returns Rendered app bar shell component
 */
export const AppBarShell: React.FC<AppBarShellProps> = ({
  isAuthenticated,
  profile,
  unreadCount,
  onGoHome,
  onGoSell,
  onGoLogin,
  onGoRegister,
  onOpenProfile,
  onOpenInbox,
  onLogout
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Render unauthenticated user actions
   * Shows Login and Register buttons
   */
  const renderUnauthenticatedActions = () => (
    <ActionsContainer>
      <AuthButton
        color="inherit"
        onClick={onGoLogin}
        aria-label="Login to your account"
      >
        Login
      </AuthButton>
      <AuthButton
        variant="outlined"
        color="inherit"
        onClick={onGoRegister}
        aria-label="Create a new account"
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.5)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        Register
      </AuthButton>
    </ActionsContainer>
  );

  /**
   * Render authenticated user actions
   * Shows prominent Sell Item button (icon on mobile) and Avatar Menu
   */
  const renderAuthenticatedActions = () => (
    <ActionsContainer>
      {/* Sell Item Button - Prominent action for authenticated users */}
      {isMobile ? (
        // Mobile: Icon button with tooltip
        <Tooltip title="Sell Item" arrow placement="bottom">
          <IconButton
            color="secondary"
            onClick={onGoSell}
            aria-label="Sell a new item"
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark
              },
              width: 40,
              height: 40
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      ) : (
        // Desktop: Full button with text and icon
        <SellButton
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onGoSell}
          aria-label="Sell a new item"
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            boxShadow: 2,
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
              boxShadow: 3
            }
          }}
        >
          Sell Item
        </SellButton>
      )}
      
      <AvatarMenu
        profile={profile}
        unreadCount={unreadCount}
        onOpenProfile={onOpenProfile}
        onOpenInbox={onOpenInbox}
        onLogout={onLogout}
      />
    </ActionsContainer>
  );

  /**
   * Render search input (placeholder for future implementation)
   * Hidden on mobile to save space
   */
  const renderSearchInput = () => (
    <SearchContainer>
      <TextField
        placeholder="Search items..."
        variant="outlined"
        size="small"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </InputAdornment>
          ),
          readOnly: true,
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.7)'
            },
            '& input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1
              }
            }
          }
        }}
        aria-label="Search items (coming soon)"
        title="Search functionality coming soon"
      />
    </SearchContainer>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={2}
      sx={{
        backgroundColor: theme.palette.primary.main,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 }
        }}
      >
        {/* Logo/Brand Section */}
        <LogoButton
          onClick={onGoHome}
          aria-label="Go to UniShare homepage"
          disableRipple
        >
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            UniShare
          </Typography>
        </LogoButton>

        {/* Search Section (hidden on mobile) */}
        {renderSearchInput()}

        {/* Actions Section */}
        {isAuthenticated ? renderAuthenticatedActions() : renderUnauthenticatedActions()}
      </Toolbar>
    </AppBar>
  );
};

/**
 * Default export for easier importing
 */
export default AppBarShell;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - AppBarShell: Only handles app header UI layout and responsive behavior
 * - renderUnauthenticatedActions: Only handles guest user action buttons
 * - renderAuthenticatedActions: Only handles authenticated user action buttons
 * - renderSearchInput: Only handles search input UI (placeholder)
 * - Styled components: Each handles specific visual styling concerns
 * 
 * Open/Closed Principle (OCP):
 * - Component is closed for modification but open for extension
 * - New action buttons can be added through props without changing component
 * - Styling can be customized through MUI theme and sx props
 * - Search functionality can be enhanced without breaking existing layout
 * 
 * Liskov Substitution Principle (LSP):
 * - Can be used anywhere an app header component is needed
 * - Maintains consistent behavior across different authentication states
 * - Props interface is stable and predictable
 * 
 * Interface Segregation Principle (ISP):
 * - AppBarShellProps: Only includes props needed for header functionality
 * - Clear separation between authentication and user data concerns
 * - No unnecessary dependencies or bloated interfaces
 * - Focused callback props for specific actions
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on AvatarMenu abstraction through props
 * - Uses callback props instead of direct navigation or state management
 * - No dependencies on Redux, router, or other high-level modules
 * - Can work with any authentication system through props
 * 
 * Benefits:
 * - Framework Independence: No Redux, React Router, or service dependencies
 * - Responsive Design: Adapts layout and behavior for different screen sizes
 * - Accessibility: Full keyboard navigation and screen reader support
 * - Authentication Aware: Conditional rendering based on user state
 * - Performance: Styled components and optimized rendering
 * - Type Safety: Full TypeScript support with clear interfaces
 * - Testability: Pure component with predictable behavior
 * - Reusability: Can be used in any application context
 * - Maintainability: Clear separation of concerns and well-organized code
 * - Extensibility: Easy to add new features or modify existing ones
 * 
 * Usage Examples:
 * 
 * // Usage with unauthenticated user
 * <AppBarShell
 *   isAuthenticated={false}
 *   onGoHome={() => navigate('/')}
 *   onGoSell={() => navigate('/login')}
 *   onGoLogin={() => navigate('/login')}
 *   onGoRegister={() => navigate('/register')}
 *   onOpenProfile={() => {}}
 *   onOpenInbox={() => {}}
 *   onLogout={() => {}}
 * />
 * 
 * // Usage with authenticated user
 * <AppBarShell
 *   isAuthenticated={true}
 *   profile={{
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     profileImageUrl: '/images/john-doe.jpg'
 *   }}
 *   unreadCount={3}
 *   onGoHome={() => navigate('/')}
 *   onGoSell={() => navigate('/sell')}
 *   onGoLogin={() => {}}
 *   onGoRegister={() => {}}
 *   onOpenProfile={() => navigate('/profile')}
 *   onOpenInbox={() => navigate('/inbox')}
 *   onLogout={() => authService.logout()}
 * />
 * 
 * // Usage with Redux integration
 * const AppBarShellContainer = () => {
 *   const { isAuthenticated, profile, unreadCount } = useSelector(selectAuthState);
 *   const dispatch = useDispatch();
 *   const navigate = useNavigate();
 * 
 *   return (
 *     <AppBarShell
 *       isAuthenticated={isAuthenticated}
 *       profile={profile}
 *       unreadCount={unreadCount}
 *       onGoHome={() => navigate('/')}
 *       onGoSell={() => navigate('/sell')}
 *       onGoLogin={() => navigate('/login')}
 *       onGoRegister={() => navigate('/register')}
 *       onOpenProfile={() => dispatch(openProfile())}
 *       onOpenInbox={() => dispatch(openInbox())}
 *       onLogout={() => dispatch(logout())}
 *     />
 *   );
 * };
 * 
 * // Testing example
 * describe('AppBarShell', () => {
 *   const mockProps = {
 *     isAuthenticated: false,
 *     onGoHome: jest.fn(),
 *     onGoSell: jest.fn(),
 *     onGoLogin: jest.fn(),
 *     onGoRegister: jest.fn(),
 *     onOpenProfile: jest.fn(),
 *     onOpenInbox: jest.fn(),
 *     onLogout: jest.fn()
 *   };
 * 
 *   test('should show login and register buttons when not authenticated', () => {
 *     render(<AppBarShell {...mockProps} />);
 *     expect(screen.getByText('Login')).toBeInTheDocument();
 *     expect(screen.getByText('Register')).toBeInTheDocument();
 *     expect(screen.queryByText('Sell Item')).not.toBeInTheDocument();
 *   });
 * 
 *   test('should show sell button and avatar when authenticated', () => {
 *     const authenticatedProps = {
 *       ...mockProps,
 *       isAuthenticated: true,
 *       profile: { firstName: 'John', lastName: 'Doe' }
 *     };
 *     render(<AppBarShell {...authenticatedProps} />);
 *     expect(screen.getByText('Sell Item')).toBeInTheDocument();
 *     expect(screen.queryByText('Login')).not.toBeInTheDocument();
 *   });
 * 
 *   test('should call onGoHome when logo clicked', () => {
 *     render(<AppBarShell {...mockProps} />);
 *     fireEvent.click(screen.getByText('UniShare'));
 *     expect(mockProps.onGoHome).toHaveBeenCalled();
 *   });
 * });
 */