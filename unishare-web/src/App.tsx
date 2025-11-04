import React from 'react';
import { Box } from '@mui/material';
import { AppRouter } from './presentation/routes';

/**
 * App component following Single Responsibility Principle
 * 
 * Responsibilities:
 * - Render top-level app structure with routing
 * - Provide main app container for consistent styling
 * - Delegate all layout and navigation concerns to AppRouter/AppLayout
 * 
 * Architecture:
 * - AppRouter handles all route configuration and layout integration
 * - AppLayout provides consistent header and content structure
 * - AppHeaderContainer manages authentication-aware navigation
 * - ProtectedRoute handles route-level authentication guards
 */
const App: React.FC = () => {
  return (
    <Box sx={{ 
      flexGrow: 1,
      width: '100%',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <AppRouter />
    </Box>
  );
};

export default App;
