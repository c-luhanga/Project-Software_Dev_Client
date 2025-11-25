import React, { useState, useEffect, useCallback } from 'react';
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
  fetchAdminUsersThunk,
  selectUsersData,
  selectUsersLoading,
  selectUsersError,
  selectOperationsLoading,
  selectOperationsError,
  clearUsersError,
  clearOperationsError,
} from '../../../store/adminSlice';
import type { AppDispatch } from '../../../store/store';
import type { AdminUser, UserSearchOptions } from '../../../domain/admin/types';

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

interface ConfirmationDialog {
  open: boolean;
  action: 'ban' | 'unban' | null;
  user: AdminUser | null;
}

const UserManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const usersData = useSelector(selectUsersData);
  const isLoadingUsers = useSelector(selectUsersLoading);
  const usersError = useSelector(selectUsersError);
  const isLoadingOperations = useSelector(selectOperationsLoading);
  const operationsError = useSelector(selectOperationsError);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    open: false,
    action: null,
    user: null,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load users on component mount and when search changes
  const loadUsers = useCallback(() => {
    const searchOptions: UserSearchOptions = {
      searchTerm: debouncedSearchTerm || undefined,
      includeAdmins: true,
      includeBanned: true,
      page: 1,
      pageSize: 50,
    };
    dispatch(fetchAdminUsersThunk(searchOptions));
  }, [dispatch, debouncedSearchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Get users list from data
  const users = usersData?.users || [];
  
  // Display total count with search context
  const displayCount = users.length;
  const totalCount = usersData?.totalCount || 0;

  // Handle ban user
  const handleBanUser = (user: AdminUser) => {
    setConfirmDialog({
      open: true,
      action: 'ban',
      user,
    });
  };

  // Handle unban user
  const handleUnbanUser = (user: AdminUser) => {
    setConfirmDialog({
      open: true,
      action: 'unban',
      user,
    });
  };

  // Confirm action
  const handleConfirmAction = async () => {
    if (!confirmDialog.user || !confirmDialog.action) return;

    try {
      if (confirmDialog.action === 'ban') {
        await dispatch(adminBanUserThunk(confirmDialog.user.id)).unwrap();
      } else {
        await dispatch(adminUnbanUserThunk(confirmDialog.user.id)).unwrap();
      }
      
      // Refresh the users list after successful operation
      loadUsers();
      
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
    if (usersError) {
      dispatch(clearUsersError());
    }
    if (operationsError) {
      dispatch(clearOperationsError());
    }
  };

  // Determine current error to display
  const currentError = usersError || operationsError;
  
  // Determine current loading state
  const isLoading = isLoadingUsers || isLoadingOperations;

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
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
      {currentError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={handleClearError}
        >
          {currentError}
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
            {displayCount} of {totalCount} user{totalCount !== 1 ? 's' : ''} {searchTerm && 'found'}
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
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                      Loading users...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {searchTerm ? 'No users found matching your search criteria.' : 'No users found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
              ))
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