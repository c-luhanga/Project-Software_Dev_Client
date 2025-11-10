/**
 * Profile Components Usage Example
 * 
 * Demonstrates how to use the presentational components
 * with business logic components following clean architecture
 */

import { useState } from 'react';
import { useProfile } from '../../../store/profileSlice-examples';
import { 
  ProfileHeader, 
  ProfileEditForm, 
  MyListings,
  type UpdateProfileCommand 
} from './index';

/**
 * Complete Profile Page Example
 * Shows how presentational components work with business logic
 */
export function ProfilePageExample() {
  const {
    profile,
    items,
    isLoading,
    error,
    updateProfile,
    loadProfile,
    clearProfileError
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle profile update
  const handleProfileUpdate = async (command: UpdateProfileCommand) => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      
      await updateProfile(command);
      setIsEditing(false);
      
      // Optionally reload profile data
      await loadProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setUpdateError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle item click
  const handleItemClick = (item: any) => {
    console.log('Navigate to item:', item.itemId);
    // Navigate to item detail page
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setUpdateError(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={clearProfileError}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <ProfileHeader 
            profile={profile} 
            size="full"
            className="flex-1"
          />
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Form (when editing) */}
        {isEditing && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Profile
            </h3>
            <ProfileEditForm
              initial={profile}
              onSubmit={handleProfileUpdate}
              loading={isUpdating}
              error={updateError || undefined}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}
      </div>

      {/* My Listings Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <MyListings
          items={items as any}
          loading={isLoading}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
}

/**
 * Compact Profile Card Example
 * Shows profile header in compact mode
 */
export function ProfileCardExample() {
  const { profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <ProfileHeader 
        profile={profile} 
        size="compact" 
        showEmail={false}
      />
    </div>
  );
}

/**
 * Standalone Edit Form Example
 * Shows edit form in a modal or separate page
 */
export function EditProfileModalExample() {
  const { profile, updateProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (command: UpdateProfileCommand) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      await updateProfile(command);
      setIsOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!profile) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Edit Profile
              </h2>
              
              <ProfileEditForm
                initial={profile}
                onSubmit={handleSubmit}
                loading={isUpdating}
                error={error || undefined}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
 * Architecture Benefits Demonstrated:
 * 
 * 1. Separation of Concerns:
 *    - Presentational components handle only UI
 *    - Business logic handled in parent components
 *    - Clear data flow through props
 * 
 * 2. Reusability:
 *    - ProfileHeader works in full and compact modes
 *    - ProfileEditForm works in modal and inline contexts
 *    - MyListings works with any item data
 * 
 * 3. Testability:
 *    - Easy to test presentational components with mock data
 *    - Business logic separate from UI components
 *    - Clear interface contracts
 * 
 * 4. Maintainability:
 *    - UI changes don't affect business logic
 *    - Business logic changes don't require UI updates
 *    - Components can be styled independently
 */