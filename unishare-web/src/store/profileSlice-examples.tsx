/**
 * Profile Slice Usage Examples
 * 
 * Demonstrates how to use the profile Redux slice in React components
 * following clean architecture and dependency injection principles
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchProfileThunk,
  updateProfileThunk,
  fetchMyItemsThunk,
  selectProfile,
  selectProfileItems,
  selectIsProfileLoading,
  selectProfileError,
  selectProfileFullName,
  selectProfileItemsCount,
  clearError
} from './profileSlice';
import type { UpdateProfileCommand } from '../domain/user/contracts';

/**
 * Example custom hook for profile management
 * Encapsulates profile-related Redux operations
 */
export function useProfile() {
  const dispatch = useAppDispatch();
  
  // Selectors
  const profile = useAppSelector(selectProfile);
  const items = useAppSelector(selectProfileItems);
  const isLoading = useAppSelector(selectIsProfileLoading);
  const error = useAppSelector(selectProfileError);
  const fullName = useAppSelector(selectProfileFullName);
  const itemsCount = useAppSelector(selectProfileItemsCount);

  // Actions
  const loadProfile = () => {
    dispatch(fetchProfileThunk());
  };

  const updateProfile = async (updates: UpdateProfileCommand) => {
    return dispatch(updateProfileThunk(updates));
  };

  const loadMyItems = () => {
    dispatch(fetchMyItemsThunk());
  };

  const clearProfileError = () => {
    dispatch(clearError());
  };

  // Load profile and items on mount
  useEffect(() => {
    loadProfile();
    loadMyItems();
  }, []);

  return {
    // State
    profile,
    items,
    isLoading,
    error,
    fullName,
    itemsCount,
    
    // Actions
    loadProfile,
    updateProfile,
    loadMyItems,
    clearProfileError
  };
}

/**
 * Example React component using profile slice
 */
export function ProfilePage() {
  const {
    profile,
    items,
    isLoading,
    error,
    fullName,
    itemsCount,
    updateProfile,
    clearProfileError
  } = useProfile();

  const handleUpdateProfile = async (updates: UpdateProfileCommand) => {
    try {
      await updateProfile(updates);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={clearProfileError}>Dismiss</button>
      </div>
    );
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  return (
    <div>
      <h1>Welcome, {fullName}!</h1>
      <div>
        <h2>Profile Information</h2>
        <p>Email: {profile.email}</p>
        <p>Phone: {profile.phone || 'Not provided'}</p>
        <p>House: {profile.house || 'Not provided'}</p>
        {profile.isAdmin && <p><strong>Administrator</strong></p>}
      </div>
      
      <div>
        <h2>Your Items ({itemsCount})</h2>
        {items.length === 0 ? (
          <p>No items posted yet</p>
        ) : (
          <ul>
            {items.map(item => (
              <li key={item.itemId}>
                <strong>{item.title}</strong>
                {item.price && <span> - ${item.price}</span>}
                <small> (Posted: {item.postedDate.toLocaleDateString()})</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button 
        onClick={() => handleUpdateProfile({ 
          phone: '+1-555-0123',
          house: 'Updated House' 
        })}
      >
        Update Profile
      </button>
    </div>
  );
}

/**
 * Example component for profile items only
 */
export function MyItemsList() {
  const items = useAppSelector(selectProfileItems);
  const isLoading = useAppSelector(selectIsProfileLoading);
  const itemsCount = useAppSelector(selectProfileItemsCount);

  if (isLoading) {
    return <div>Loading your items...</div>;
  }

  return (
    <div>
      <h3>My Items ({itemsCount})</h3>
      {items.map(item => (
        <div key={item.itemId}>
          <h4>{item.title}</h4>
          {item.price && <p>Price: ${item.price}</p>}
          <p>Status: {item.statusId}</p>
          {item.thumbnailUrl && (
            <img src={item.thumbnailUrl} alt={item.title} width="100" />
          )}
        </div>
      ))}
    </div>
  );
}

/*
 * Redux Slice Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Profile slice only manages profile and items state
 *    - Clear separation from auth state and other features
 *    - Each thunk has focused responsibility
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - No direct service imports in slice
 *    - Services injected via thunk extra argument
 *    - Easy to mock services for testing
 * 
 * 3. Type Safety:
 *    - Full TypeScript support with proper typing
 *    - Compile-time validation of state access
 *    - IntelliSense for selectors and actions
 * 
 * 4. Testability:
 *    - Reducers are pure functions
 *    - Thunks can be tested with mocked services
 *    - Selectors can be tested independently
 * 
 * 5. Reusability:
 *    - Selectors can be used across multiple components
 *    - Custom hooks encapsulate common patterns
 *    - Actions are consistent across the application
 */

/*
 * Testing Example:
 * 
 * // Test thunk with mocked service
 * const mockUserService = {
 *   getProfile: jest.fn().mockResolvedValue(mockProfile),
 *   updateProfile: jest.fn(),
 *   getMyItems: jest.fn().mockResolvedValue([])
 * };
 * 
 * const mockExtra = {
 *   container: {
 *     getUserService: () => mockUserService
 *   }
 * };
 * 
 * // Test thunk
 * await store.dispatch(fetchProfileThunk()).unwrap();
 * expect(mockUserService.getProfile).toHaveBeenCalled();
 * 
 * // Test selector
 * const state = { profile: { profile: mockProfile, items: [], status: 'succeeded' } };
 * expect(selectProfile(state)).toEqual(mockProfile);
 */