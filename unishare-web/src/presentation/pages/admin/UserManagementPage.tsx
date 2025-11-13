import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { 
  adminBanUserThunk,
  adminUnbanUserThunk,
  selectOperationsLoading,
  selectOperationsError,
  clearOperationsError,
} from '../../../store/adminSlice';
import type { AppDispatch } from '../../../store/store';

/**
 * UserManagement Component - Admin user management interface
 * 
 * Single Responsibility Principle (SRP):
 * - Handles user listing, searching, and moderation actions
 * - Provides interface for banning/unbanning users
 * - Shows user status and administrative information
 * 
 * Features:
 * - User search and filtering
 * - Ban/unban functionality with confirmation
 * - Real-time loading states and error handling
 * - Responsive table design
 */

// Mock user data for demonstration
const mockUsers = [
  {
    id: 1,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isAdmin: false,
    isBanned: false,
    registrationDate: '2024-01-15T10:30:00Z',
    lastLoginDate: '2024-11-10T14:22:00Z',
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    isAdmin: false,
    isBanned: true,
    registrationDate: '2024-02-20T09:15:00Z',
    lastLoginDate: '2024-10-28T16:45:00Z',
  },
  {
    id: 3,
    email: 'admin.user@principia.edu',
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
    isBanned: false,
    registrationDate: '2024-01-01T00:00:00Z',
    lastLoginDate: '2024-11-12T08:00:00Z',
  },
  {
    id: 4,
    email: 'bob.wilson@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    isAdmin: false,
    isBanned: false,
    registrationDate: '2024-03-10T12:00:00Z',
    lastLoginDate: '2024-11-11T19:30:00Z',
  },
];

interface ConfirmationDialog {
  open: boolean;
  action: 'ban' | 'unban' | null;
  user: typeof mockUsers[0] | null;
}

const UserManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Debug logging
  console.log('UserManagementPage component rendering');
  
  // Redux state - temporarily comment out the selectors that use container
  // const isLoading = useSelector(selectOperationsLoading);
  // const error = useSelector(selectOperationsError);
  
  // Hardcode for debugging
  const isLoading = false;
  const error = null;

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState(mockUsers); // In real app, this would come from Redux
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    open: false,
    action: null,
    user: null,
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower)
    );
  });

  // Handle ban user
  const handleBanUser = (user: typeof mockUsers[0]) => {
    setConfirmDialog({
      open: true,
      action: 'ban',
      user,
    });
  };

  // Handle unban user
  const handleUnbanUser = (user: typeof mockUsers[0]) => {
    setConfirmDialog({
      open: true,
      action: 'unban',
      user,
    });
  };

  // Confirm action - temporarily disable actual API calls
  const handleConfirmAction = async () => {
    if (!confirmDialog.user || !confirmDialog.action) return;

    try {
      console.log('Would perform action:', confirmDialog.action, 'on user:', confirmDialog.user.id);
      
      // Temporarily comment out actual API calls for debugging
      // if (confirmDialog.action === 'ban') {
      //   await dispatch(adminBanUserThunk(confirmDialog.user.id)).unwrap();
      // } else {
      //   await dispatch(adminUnbanUserThunk(confirmDialog.user.id)).unwrap();
      // }
      
      // In a real app, you would refresh the users list here
      // dispatch(fetchUsersThunk());
      
      setConfirmDialog({ open: false, action: null, user: null });
    } catch (error) {
      // Error is handled by Redux
      console.error('Action failed:', error);
    }
  };

  // Cancel action
  const handleCancelAction = () => {
    setConfirmDialog({ open: false, action: null, user: null });
  };

  // Clear error
  const handleClearError = () => {
    dispatch(clearOperationsError());
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage user accounts, view activity, and perform moderation actions.
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={handleClearError}
        >
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Registration</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={user.isBanned ? 'Banned' : 'Active'}
                    color={user.isBanned ? 'error' : 'success'}
                    size="small"
                    icon={user.isBanned ? <BlockIcon /> : <UnblockIcon />}
                  />
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={user.isAdmin ? 'Admin' : 'User'}
                    color={user.isAdmin ? 'secondary' : 'default'}
                    size="small"
                    icon={user.isAdmin ? <AdminIcon /> : <PersonIcon />}
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(user.registrationDate)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Never'}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {user.isBanned ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleUnbanUser(user)}
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={16} /> : <UnblockIcon />}
                      >
                        Unban
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleBanUser(user)}
                        disabled={isLoading || user.isAdmin}
                        startIcon={isLoading ? <CircularProgress size={16} /> : <BlockIcon />}
                      >
                        Ban
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No users found matching your search criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCancelAction}>
        <DialogTitle>
          {confirmDialog.action === 'ban' ? 'Ban User' : 'Unban User'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === 'ban' 
              ? `Are you sure you want to ban ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}? They will no longer be able to access the platform.`
              : `Are you sure you want to unban ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}? They will regain access to the platform.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.action === 'ban' ? 'error' : 'success'}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            {confirmDialog.action === 'ban' ? 'Ban User' : 'Unban User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;