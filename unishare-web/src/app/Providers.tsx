import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../store/store';
import { AppThemeProvider } from '../presentation/theme';

/**
 * Props interface for Providers component
 */
export interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component following Single Responsibility Principle
 * 
 * Responsibility: Wraps the application with necessary providers
 * - Redux Provider for state management
 * - BrowserRouter for routing context
 * - AppThemeProvider for MUI styling with CssBaseline
 * 
 * No business logic - pure provider composition
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default Providers;