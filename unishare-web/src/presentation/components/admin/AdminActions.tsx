import React from 'react';
import {
  Toolbar,
  Button,
  Box,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BlockIcon
} from '@mui/icons-material';

/**
 * Admin Actions Toolbar Component
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Responsible only for rendering admin moderation action buttons
 * - Pure presentational component with no business logic or state
 * - Delegates all actions to parent via props callbacks
 * 
 * Interface Segregation Principle (ISP):
 * - Minimal interface with only required action callbacks
 * - Optional disabled prop for external state control
 * - No unnecessary dependencies or coupled logic
 */

interface AdminActionsProps {
  /** Callback fired when delete item button is clicked */
  onDeleteItem: () => void;
  /** Callback fired when ban user button is clicked with user ID */
  onBanUser: (userId: number) => void;
  /** Whether all actions should be disabled */
  disabled?: boolean;
  /** User ID for ban action - required when ban functionality is available */
  userId: number;
}

/**
 * AdminActions - Presentational toolbar for admin moderation controls
 * 
 * This component provides a clean Material-UI toolbar interface for
 * administrative moderation actions. It follows clean architecture
 * principles by keeping UI concerns separate from business logic.
 * 
 * @param props - AdminActionsProps containing action callbacks and state
 * @returns JSX.Element - Rendered admin actions toolbar
 */
const AdminActions: React.FC<AdminActionsProps> = ({
  onDeleteItem,
  onBanUser,
  disabled = false,
  userId
}) => {
  /**
   * Handle delete item action
   */
  const handleDeleteItem = () => {
    if (!disabled) {
      onDeleteItem();
    }
  };

  /**
   * Handle ban user action
   */
  const handleBanUser = () => {
    if (!disabled) {
      onBanUser(userId);
    }
  };

  return (
    <Box sx={{ 
      border: 1, 
      borderColor: 'error.main',
      borderRadius: 1,
      backgroundColor: 'error.light',
      color: 'error.contrastText'
    }}>
      <Toolbar 
        variant="dense"
        sx={{ 
          minHeight: 48,
          backgroundColor: 'error.main',
          color: 'error.contrastText'
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Delete Item Button */}
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteItem}
            disabled={disabled}
            sx={{
              backgroundColor: 'error.dark',
              '&:hover': {
                backgroundColor: 'error.main'
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            Delete Post
          </Button>

          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              backgroundColor: 'error.contrastText',
              opacity: 0.3
            }}
          />

          {/* Ban User Button */}
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<BlockIcon />}
            onClick={handleBanUser}
            disabled={disabled}
            sx={{
              backgroundColor: 'error.dark',
              '&:hover': {
                backgroundColor: 'error.main'
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            Ban User
          </Button>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default AdminActions;