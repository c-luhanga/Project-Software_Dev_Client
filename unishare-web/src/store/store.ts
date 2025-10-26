import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, Action } from '@reduxjs/toolkit';
import { container } from '../core/container';

/**
 * Extra argument interface for thunk middleware
 * Enables Dependency Inversion Principle in Redux thunks
 */
export interface ThunkExtraArgument {
  container: typeof container;
}

/**
 * Redux store configuration following Single Responsibility Principle
 * Store is responsible only for state management and middleware setup
 */
export const store = configureStore({
  reducer: {
    // TODO: Add feature slices here
    // auth: authSlice.reducer,
    // items: itemsSlice.reducer,
    // messages: messagesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        // Inject container as extra argument for Dependency Inversion
        extraArgument: {
          container,
        } as ThunkExtraArgument,
      },
      // Enable additional middleware for development
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  // Enable Redux DevTools in development
  devTools: import.meta.env.DEV,
});

/**
 * Typed store types for type-safe Redux usage
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Typed thunk action with dependency injection support
 * Thunks can access services through extraArgument.container
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  ThunkExtraArgument,
  Action<string>
>;

/**
 * Type-safe thunk creator with extra argument access
 * Usage: const thunk = createAppThunk(async (arg, { extra: { container } }) => { ... })
 */
export interface ThunkAPI {
  dispatch: AppDispatch;
  state: RootState;
  extra: ThunkExtraArgument;
  rejectValue?: unknown;
}

/**
 * Helper type for async thunk creators
 */
export type AsyncThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  extra: ThunkExtraArgument;
  rejectValue: string;
};

/**
 * Store setup validation
 * Ensures store is properly configured in development
 */
if (import.meta.env.DEV) {
  console.log('Redux store configured with:', {
    middleware: 'Redux Toolkit default + thunk with DI',
    devTools: true,
    extraArgument: 'container (DI)',
  });
}