/**
 * Avatar Menu Component
 * 
 * Presentational component following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles avatar menu UI
 * - Interface Segregation Principle (ISP): Minimal, focused props interface
 * 
 * Framework Independence:
 * - No Redux, routing, or external service dependencies
 * - Pure UI component with callback-based interactions
 * - Can be used in any React application context
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon,
  Inbox as InboxIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { getUserInitials } from '../../../utils/userInitials';

/**
 * User profile data structure
 * Minimal interface following ISP - only what's needed for avatar display
 */
export interface UserProfile {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly profileImageUrl?: string;
}

/**
 * Avatar menu component props
 * Focused interface with clear separation of concerns
 */
export interface AvatarMenuProps {
  /** User profile data for avatar display */
  readonly profile?: UserProfile;
  
  /** Number of unread messages (hidden if 0 or undefined) */
  readonly unreadCount?: number;
  
  /** Callback when user wants to open their profile */
  readonly onOpenProfile: () => void;
  
  /** Callback when user wants to open their inbox */
  readonly onOpenInbox: () => void;
  
  /** Callback when user wants to logout */
  readonly onLogout: () => void;
}

/**
 * AvatarMenu - Presentational avatar dropdown component
 * 
 * Features:
 * - Avatar with profile image or initials fallback
 * - Badge with unread message count
 * - Dropdown menu with Profile, Inbox, Logout options
 * - Desktop hover behavior with grace period
 * - Full keyboard accessibility
 * - Responsive design considerations
 * 
 * Accessibility:
 * - ARIA labels and roles
 * - Keyboard navigation (Enter/Space to open, Esc to close)
 * - Screen reader friendly
 * - Focus management
 * 
 * @param props Component props
 * @returns Rendered avatar menu component
 */
export const AvatarMenu: React.FC<AvatarMenuProps> = ({
  profile,
  unreadCount,
  onOpenProfile,
  onOpenInbox,
  onLogout
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Menu state management
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  
  const isMenuOpen = Boolean(anchorEl);

  // Generate avatar content
  const avatarInitials = getUserInitials(
    profile?.firstName,
    profile?.lastName
  );

  // Handle menu opening
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  // Handle menu closing
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setIsHoverOpen(false);
    
    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Handle desktop hover - open menu
  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;

    // Clear any pending close timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHoverOpen(true);
  }, [isMobile]);

  // Handle desktop hover - close menu with grace period
  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;

    // Add 150ms grace period to prevent flicker
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsHoverOpen(false);
      setAnchorEl(null);
    }, 150);
  }, [isMobile]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isMenuOpen) {
        handleMenuOpen(event as any);
      }
    } else if (event.key === 'Escape' && isMenuOpen) {
      event.preventDefault();
      handleMenuClose();
    }
  }, [isMenuOpen, handleMenuOpen, handleMenuClose]);

  // Handle menu item clicks
  const handleProfileClick = useCallback(() => {
    handleMenuClose();
    onOpenProfile();
  }, [handleMenuClose, onOpenProfile]);

  const handleInboxClick = useCallback(() => {
    handleMenuClose();
    onOpenInbox();
  }, [handleMenuClose, onOpenInbox]);

  const handleLogoutClick = useCallback(() => {
    handleMenuClose();
    onLogout();
  }, [handleMenuClose, onLogout]);

  // Effect to handle hover-based menu opening
  React.useEffect(() => {
    if (isHoverOpen && !isMenuOpen && !isMobile) {
      const buttonElement = document.querySelector('[data-testid="avatar-menu-button"]') as HTMLElement;
      if (buttonElement) {
        setAnchorEl(buttonElement);
      }
    }
  }, [isHoverOpen, isMenuOpen, isMobile]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Determine if badge should be shown
  const showBadge = unreadCount && unreadCount > 0;

  // Badge component
  const badgeContent = showBadge ? (
    <Badge
      badgeContent={unreadCount}
      color="error"
      max={99}
      sx={{
        '& .MuiBadge-badge': {
          fontSize: '0.75rem',
          height: '18px',
          minWidth: '18px'
        }
      }}
    >
      <Avatar
        src={profile?.profileImageUrl}
        alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User avatar'}
        sx={{
          width: 40,
          height: 40,
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {!profile?.profileImageUrl && avatarInitials}
      </Avatar>
    </Badge>
  ) : (
    <Avatar
      src={profile?.profileImageUrl}
      alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User avatar'}
      sx={{
        width: 40,
        height: 40,
        fontSize: '1rem',
        fontWeight: 600
      }}
    >
      {!profile?.profileImageUrl && avatarInitials}
    </Avatar>
  );

  return (
    <>
      <Tooltip
        title="Account menu"
        arrow
        placement="bottom"
      >
        <IconButton
          onClick={handleMenuOpen}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          data-testid="avatar-menu-button"
          aria-label="Account menu"
          aria-controls={isMenuOpen ? 'avatar-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
          sx={{
            padding: 0.5,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          {badgeContent}
        </IconButton>
      </Tooltip>

      <Menu
        id="avatar-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        MenuListProps={{
          'aria-labelledby': 'avatar-menu-button',
          role: 'menu'
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 180,
              borderRadius: 2,
              mt: 1,
              border: `1px solid ${theme.palette.divider}`,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                borderRadius: 1,
                mx: 0.5,
                mb: 0.5,
                '&:last-child': {
                  mb: 0
                }
              }
            }
          }
        }}
      >
        <MenuItem
          onClick={handleProfileClick}
          role="menuitem"
          aria-label="View profile"
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem
          onClick={handleInboxClick}
          role="menuitem"
          aria-label={`View inbox${showBadge ? ` (${unreadCount} unread)` : ''}`}
        >
          <ListItemIcon>
            <Badge
              badgeContent={showBadge ? unreadCount : 0}
              color="error"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  height: '14px',
                  minWidth: '14px',
                  transform: 'scale(0.8)'
                }
              }}
            >
              <InboxIcon fontSize="small" />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </MenuItem>

        <MenuItem
          onClick={handleLogoutClick}
          role="menuitem"
          aria-label="Logout"
          sx={{
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.light + '20'
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon
              fontSize="small"
              sx={{ color: theme.palette.error.main }}
            />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </>
  );
};

/**
 * Default export for easier importing
 */
export default AvatarMenu;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - AvatarMenu: Only handles avatar menu UI and user interactions
 * - UserProfile interface: Only defines user data needed for avatar display
 * - Event handlers: Each handles a specific user action
 * - Accessibility helpers: Each manages a specific accessibility concern
 * 
 * Open/Closed Principle (OCP):
 * - Component is closed for modification but open for extension
 * - New menu items can be added by extending props interface
 * - Styling can be customized through MUI theme and sx props
 * - Behavior can be extended through additional callback props
 * 
 * Liskov Substitution Principle (LSP):
 * - Can be used anywhere a user menu component is needed
 * - Maintains consistent behavior across different contexts
 * - Props interface is stable and predictable
 * 
 * Interface Segregation Principle (ISP):
 * - AvatarMenuProps: Only includes props needed for this specific component
 * - UserProfile: Minimal interface with only display-related fields
 * - No unnecessary dependencies or bloated interfaces
 * - Clear separation between data and behavior props
 * 
 * Dependency Inversion Principle (DIP):
 * - Depends on getUserInitials abstraction, not specific implementation
 * - Uses callback props instead of direct navigation or state management
 * - No dependencies on Redux, router, or other high-level modules
 * - Can work with any user data structure through props mapping
 * 
 * Benefits:
 * - Framework Independence: No Redux, React Router, or service dependencies
 * - Accessibility: Full keyboard navigation and screen reader support
 * - Responsive Design: Adapts behavior for mobile vs desktop
 * - User Experience: Hover behavior with grace period to prevent flicker
 * - Type Safety: Full TypeScript support with clear interfaces
 * - Testability: Pure component with predictable behavior
 * - Reusability: Can be used in any application context
 * - Performance: Optimized with useCallback and proper event handling
 * - Maintainability: Clear separation of concerns and well-documented code
 * 
 * Usage Examples:
 * 
 * // Basic usage with profile data
 * <AvatarMenu
 *   profile={{
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     profileImageUrl: '/images/john-doe.jpg'
 *   }}
 *   unreadCount={3}
 *   onOpenProfile={() => navigate('/profile')}
 *   onOpenInbox={() => navigate('/inbox')}
 *   onLogout={() => authService.logout()}
 * />
 * 
 * // Usage without profile image (shows initials)
 * <AvatarMenu
 *   profile={{
 *     firstName: 'Jane',
 *     lastName: 'Smith'
 *   }}
 *   onOpenProfile={handleOpenProfile}
 *   onOpenInbox={handleOpenInbox}
 *   onLogout={handleLogout}
 * />
 * 
 * // Usage with Redux integration
 * const AvatarMenuContainer = () => {
 *   const { profile, unreadCount } = useSelector(selectUserState);
 *   const dispatch = useDispatch();
 * 
 *   return (
 *     <AvatarMenu
 *       profile={profile}
 *       unreadCount={unreadCount}
 *       onOpenProfile={() => dispatch(openProfile())}
 *       onOpenInbox={() => dispatch(openInbox())}
 *       onLogout={() => dispatch(logout())}
 *     />
 *   );
 * };
 * 
 * // Testing example
 * describe('AvatarMenu', () => {
 *   const mockProps = {
 *     profile: { firstName: 'John', lastName: 'Doe' },
 *     unreadCount: 5,
 *     onOpenProfile: jest.fn(),
 *     onOpenInbox: jest.fn(),
 *     onLogout: jest.fn()
 *   };
 * 
 *   test('should display user initials when no profile image', () => {
 *     render(<AvatarMenu {...mockProps} />);
 *     expect(screen.getByText('JD')).toBeInTheDocument();
 *   });
 * 
 *   test('should show unread count badge', () => {
 *     render(<AvatarMenu {...mockProps} />);
 *     expect(screen.getByText('5')).toBeInTheDocument();
 *   });
 * 
 *   test('should call onOpenProfile when profile menu item clicked', async () => {
 *     render(<AvatarMenu {...mockProps} />);
 *     fireEvent.click(screen.getByRole('button'));
 *     fireEvent.click(screen.getByText('Profile'));
 *     expect(mockProps.onOpenProfile).toHaveBeenCalled();
 *   });
 * });
 */