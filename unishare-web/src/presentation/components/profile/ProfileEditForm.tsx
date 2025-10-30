/**
 * Profile Edit Form Component
 * 
 * Presentational component following Single Responsibility Principle (SRP)
 * - Single responsibility: Render profile edit form UI
 * - No Redux access or business logic
 * - No HTTP calls - delegates to parent via onSubmit
 * - Pure form component with controlled state
 */

import { useState, useEffect } from 'react';
import type { UserProfile, UpdateProfileCommand } from '../../../domain/user/contracts';

/**
 * Profile Edit Form props following Interface Segregation Principle (ISP)
 * Clean interface with only required form data and callbacks
 */
interface ProfileEditFormProps {
  /** Initial form values */
  initial: Partial<UserProfile>;
  /** Form submission handler */
  onSubmit: (command: UpdateProfileCommand) => void;
  /** Loading state for submit button */
  loading: boolean;
  /** Error message to display */
  error?: string;
  /** Optional cancel handler */
  onCancel?: () => void;
  /** Custom form className */
  className?: string;
}

/**
 * Form data interface for internal state management
 */
interface FormData {
  phone: string;
  house: string;
  profileImageUrl: string;
}

/**
 * Profile Edit Form Component
 * Pure presentational form component with no external dependencies
 */
export function ProfileEditForm({
  initial,
  onSubmit,
  loading,
  error,
  onCancel,
  className = ''
}: ProfileEditFormProps) {
  // Local form state
  const [formData, setFormData] = useState<FormData>({
    phone: initial.phone || '',
    house: initial.house || '',
    profileImageUrl: initial.profileImageUrl || ''
  });

  const [touchedFields, setTouchedFields] = useState<Set<keyof FormData>>(new Set());

  // Update form data when initial values change
  useEffect(() => {
    setFormData({
      phone: initial.phone || '',
      house: initial.house || '',
      profileImageUrl: initial.profileImageUrl || ''
    });
  }, [initial]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setTouchedFields(prev => new Set(prev).add(field));
  };

  // Handle image file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      handleInputChange('profileImageUrl', previewUrl);
    }
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Create update command with only changed, non-empty fields
    const command: UpdateProfileCommand = {};
    
    if (touchedFields.has('phone')) {
      const phone = formData.phone.trim() || undefined;
      Object.assign(command, { phone });
    }
    
    if (touchedFields.has('house')) {
      const house = formData.house.trim() || undefined;
      Object.assign(command, { house });
    }
    
    if (touchedFields.has('profileImageUrl')) {
      const profileImageUrl = formData.profileImageUrl || undefined;
      Object.assign(command, { profileImageUrl });
    }

    onSubmit(command);
  };

  // Check if form has changes
  const hasChanges = touchedFields.size > 0;

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Profile Image Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Profile Image
        </label>
        
        <div className="flex items-center space-x-4">
          {/* Image Preview */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {formData.profileImageUrl ? (
              <img
                src={formData.profileImageUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* File Input */}
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              JPEG, PNG, or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            focus:outline-none focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500"
          disabled={loading}
        />
      </div>

      {/* House Field */}
      <div>
        <label htmlFor="house" className="block text-sm font-medium text-gray-700">
          House/Residence
        </label>
        <input
          type="text"
          id="house"
          value={formData.house}
          onChange={(e) => handleInputChange('house', e.target.value)}
          placeholder="e.g., Dorm A, Room 123"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            focus:outline-none focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500"
          disabled={loading}
        />
      </div>

      {/* Read-only Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email (Read-only)
        </label>
        <input
          type="email"
          id="email"
          value={initial.email || ''}
          readOnly
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          Contact support to change your email address.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
              rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading || !hasChanges}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent 
            rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
            focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center space-x-2"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
}

/*
 * Component Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Only responsible for form UI and local form state
 *    - No business logic, API calls, or global state access
 *    - Delegates all actions to parent components
 * 
 * 2. Interface Segregation Principle (ISP):
 *    - Clean props interface with only required data
 *    - Optional props for customization
 *    - No forced dependencies on Redux or other services
 * 
 * 3. Controlled Component:
 *    - All form state managed locally
 *    - Predictable data flow
 *    - Easy to test and validate
 * 
 * 4. Accessibility:
 *    - Proper form labels and associations
 *    - Keyboard navigation support
 *    - Screen reader friendly
 * 
 * 5. User Experience:
 *    - Shows only changed fields in update command
 *    - Visual feedback for loading states
 *    - Clear error messaging
 *    - Image preview functionality
 * 
 * Usage Example:
 * 
 * <ProfileEditForm
 *   initial={userProfile}
 *   onSubmit={handleProfileUpdate}
 *   loading={isUpdating}
 *   error={updateError}
 *   onCancel={handleCancel}
 * />
 */