import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, Action } from '@reduxjs/toolkit';
import { container } from '../core/container';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import itemsReducer from './itemsSlice';
import messagingReducer from './messagingSlice';
import adminReducer from './adminSlice';

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
    auth: authReducer,
    profile: profileReducer,
    items: itemsReducer,
    messaging: messagingReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        // Inject container as extra argument for Dependency Inversion
        extraArgument: {
          container: container,
        } as ThunkExtraArgument,
      },
      // Configure serializable check to allow Date objects and File objects in specific paths
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Allow Date objects in profile-related actions and state paths
        ignoredActionPaths: [
          'payload.createdAt', 
          'payload.lastSeen', 
          'payload.postedDate',
          // Allow File objects in upload actions
          'meta.arg.files',
          'meta.arg.files.0',
          'meta.arg.files.1', 
          'meta.arg.files.2',
          'meta.arg.files.3'
        ],
        ignoredPaths: [
          'profile.profile.createdAt',
          'profile.profile.lastSeen',
          'profile.items.0.postedDate',
          'profile.items.1.postedDate',
          'profile.items.2.postedDate',
          'profile.items.3.postedDate',
          'profile.items.4.postedDate',
          'profile.items.5.postedDate',
          'profile.items.6.postedDate',
          'profile.items.7.postedDate',
          'profile.items.8.postedDate',
          'profile.items.9.postedDate',
        ],
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