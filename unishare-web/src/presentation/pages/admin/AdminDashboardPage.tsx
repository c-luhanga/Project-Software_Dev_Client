import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Alert, 
  Button,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingBag as ShoppingBagIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { StatCard, formatLargeNumber } from '../../components/admin/StatCard';
import { 
  fetchAdminDashboardThunk,
  selectDashboardData,
  selectDashboardLoading,
  selectDashboardError,
  selectDashboardLastFetched,
  resetDashboard,
} from '../../../store/adminSlice';
import type { AppDispatch } from '../../../store/store';

/**
 * AdminDashboardPage - Main admin dashboard interface
 * 
 * Single Responsibility Principle (SRP):
 * - Displays admin dashboard overview and navigation
 * - Serves as entry point for all admin operations
 * - Provides quick access to admin tools and statistics
 * 
 * Features:
 * - Real-time platform statistics
 * - Loading states and error handling
 * - Quick action buttons for admin tasks
 * - Responsive design for mobile and desktop
 */
const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const dashboardData = useSelector(selectDashboardData);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastFetched = useSelector(selectDashboardLastFetched);

  // Fetch dashboard data on component mount
  useEffect(() => {
    dispatch(fetchAdminDashboardThunk());
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    dispatch(resetDashboard());
    dispatch(fetchAdminDashboardThunk());
  };

  // Format last updated time
  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Platform overview and administrative controls
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {lastFetched && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {formatLastUpdated(lastFetched)}
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Platform Status */}
      {dashboardData && (
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Platform Status:</Typography>
              <Chip 
                label={dashboardData.status}
                color={dashboardData.status === 'Operational' ? 'success' : 'warning'}
                icon={dashboardData.status === 'Operational' ? <CheckCircleIcon /> : <TrendingUpIcon />}
              />
              {dashboardData.lastUpdated && (
                <Typography variant="caption" color="text.secondary">
                  Data as of {new Date(dashboardData.lastUpdated).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Statistics Grid */}
      <Box sx={{ 
        display: 'grid', 
        gap: 3, 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        mb: 4 
      }}>
        {/* User Statistics */}
        <StatCard
          title="Total Users"
          value={dashboardData?.totalUsers ?? 0}
          subtitle="Registered accounts"
          icon={<PeopleIcon />}
          loading={isLoading}
          error={error}
          color="primary"
          formatValue={formatLargeNumber}
        />
        
        <StatCard
          title="Active Users"
          value={dashboardData ? (dashboardData.totalUsers - dashboardData.bannedUsers) : 0}
          subtitle="Not banned"
          icon={<CheckCircleIcon />}
          loading={isLoading}
          error={error}
          color="success"
          formatValue={formatLargeNumber}
        />
        
        <StatCard
          title="Banned Users"
          value={dashboardData?.bannedUsers ?? 0}
          subtitle="Moderation actions"
          icon={<BlockIcon />}
          loading={isLoading}
          error={error}
          color="error"
          formatValue={formatLargeNumber}
        />
        
        <StatCard
          title="Admin Users"
          value={dashboardData?.adminUsers ?? 0}
          subtitle="Administrative accounts"
          icon={<AdminIcon />}
          loading={isLoading}
          error={error}
          color="secondary"
          formatValue={formatLargeNumber}
        />
        
        {/* Item Statistics */}
        <StatCard
          title="Total Items"
          value={dashboardData?.totalItems ?? 0}
          subtitle="All listings"
          icon={<ShoppingBagIcon />}
          loading={isLoading}
          error={error}
          color="info"
          formatValue={formatLargeNumber}
        />
        
        <StatCard
          title="Active Items"
          value={dashboardData?.activeItems ?? 0}
          subtitle="Available for purchase"
          icon={<TrendingUpIcon />}
          loading={isLoading}
          error={error}
          color="success"
          formatValue={formatLargeNumber}
        />
        
        <StatCard
          title="Pending Items"
          value={dashboardData?.pendingItems ?? 0}
          subtitle="Awaiting review"
          icon={<CheckCircleIcon />}
          loading={isLoading}
          error={error}
          color="warning"
          formatValue={formatLargeNumber}
        />
        
        <StatCard
          title="Sold Items"
          value={dashboardData?.soldItems ?? 0}
          subtitle="Completed transactions"
          icon={<CheckCircleIcon />}
          loading={isLoading}
          error={error}
          color="primary"
          formatValue={formatLargeNumber}
        />
      </Box>

      {/* Quick Actions Panel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          mt: 2 
        }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => window.location.href = '/admin/users'}
          >
            Manage Users
          </Button>
          
          <Button 
            variant="outlined" 
            color="info"
            onClick={() => window.location.href = '/items'}
          >
            View All Items
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh Dashboard
          </Button>
        </Box>
      </Paper>

      {/* Recent Activity Panel */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        
        {dashboardData ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Platform Status:</strong> {dashboardData.status}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Last Data Update:</strong> {new Date(dashboardData.lastUpdated).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Total Platform Activity:</strong>{' '}
              {formatLargeNumber(dashboardData.totalUsers + dashboardData.totalItems)} total entities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Active Ratio:</strong>{' '}
              {dashboardData.totalItems > 0 
                ? `${Math.round((dashboardData.activeItems / dashboardData.totalItems) * 100)}%` 
                : '0%'} of items are currently active
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            System status information will be displayed here once dashboard data is loaded.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;