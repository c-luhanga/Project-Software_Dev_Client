import { createTheme } from '@mui/material/styles';
import type { ThemeOptions, Theme } from '@mui/material/styles';

/**
 * Brand color configuration following Open/Closed Principle
 * Colors can be modified here without touching UI components
 */
const brandColors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63',
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

/**
 * Typography configuration following Single Responsibility Principle
 * Handles only font-related styling decisions
 */
const typographyConfig = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.005em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    textTransform: 'none' as const,
    letterSpacing: '0.02em',
  },
};

/**
 * Component style overrides following Open/Closed Principle
 * Customizations can be added without modifying individual components
 */
const componentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        textTransform: 'none' as const,
        fontWeight: 500,
        padding: '10px 20px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: brandColors.primary[400],
          },
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${brandColors.neutral[200]}`,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      elevation2: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      elevation3: {
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        border: `1px solid ${brandColors.neutral[200]}`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
};

/**
 * Base theme configuration following Single Responsibility Principle
 * Responsible only for defining the core design system
 */
const baseThemeConfig: ThemeOptions = {
  palette: {
    primary: {
      main: brandColors.primary[600],
      light: brandColors.primary[400],
      dark: brandColors.primary[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.secondary[600],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[800],
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: brandColors.primary[500],
      light: brandColors.primary[300],
      dark: brandColors.primary[700],
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    grey: brandColors.neutral,
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
    },
    text: {
      primary: brandColors.neutral[900],
      secondary: brandColors.neutral[600],
      disabled: brandColors.neutral[400],
    },
    divider: brandColors.neutral[200],
  },
  typography: typographyConfig,
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  components: componentOverrides,
};

/**
 * Light theme - default theme
 */
export const lightTheme: Theme = createTheme(baseThemeConfig);

/**
 * Dark theme configuration following Open/Closed Principle
 * Extends base theme without modifying it
 */
export const darkTheme: Theme = createTheme({
  ...baseThemeConfig,
  palette: {
    ...baseThemeConfig.palette,
    mode: 'dark',
    background: {
      default: '#0f1419',
      paper: '#1a1f2e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    primary: {
      main: brandColors.primary[400],
      light: brandColors.primary[300],
      dark: brandColors.primary[600],
      contrastText: '#000000',
    },
    secondary: {
      main: brandColors.secondary[400],
      light: brandColors.secondary[300],
      dark: brandColors.secondary[600],
      contrastText: '#000000',
    },
  },
});

/**
 * Default theme export - can be easily swapped
 */
export const theme = lightTheme;

/**
 * Theme configuration object for external customization
 * Follows Open/Closed Principle - themes can be modified without changing components
 */
export const themeConfig = {
  light: lightTheme,
  dark: darkTheme,
  brandColors,
  typographyConfig,
};