/**
 * Theme module exports following Single Responsibility Principle
 * Provides clean interface for theme-related functionality
 */

// Theme configurations
export { 
  theme, 
  lightTheme, 
  darkTheme, 
  themeConfig 
} from './theme';

// Theme provider components
export { 
  AppThemeProvider,
  useTheme 
} from './ThemeProvider';

// Type exports
export type { 
  AppThemeProviderProps 
} from './ThemeProvider';

export type { Theme } from '@mui/material/styles';

/**
 * Default export for convenience
 */
export { AppThemeProvider as default } from './ThemeProvider';