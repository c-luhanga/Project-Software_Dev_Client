import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { theme as defaultTheme } from './theme';

/**
 * Props interface for AppThemeProvider
 */
export interface AppThemeProviderProps {
  children: React.ReactNode;
  theme?: Theme;
}

/**
 * Theme provider wrapper following Single Responsibility Principle
 * 
 * Responsibilities:
 * - Wraps app with MUI ThemeProvider
 * - Applies CssBaseline for consistent styling foundation
 * - Allows theme customization through props (OCP)
 * 
 * No business logic - pure presentation layer component
 */
export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ 
  children, 
  theme = defaultTheme 
}) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

/**
 * Hook for accessing theme in components
 * Provides type-safe theme access
 */
export { useTheme } from '@mui/material/styles';

/**
 * Theme context utilities
 */
export type { Theme } from '@mui/material/styles';