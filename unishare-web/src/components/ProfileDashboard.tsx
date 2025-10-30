/**
 * Profile Dashboard Component
 * 
 * Demonstrates Clean Architecture integration with React:
 * - Uses Redux slice for state management
 * - Follows dependency injection principles
 * - Maintains separation of concerns
 * - Type-safe throughout
 */

import React, { useState } from 'react';
import { useProfile } from '../store/profileSlice-examples';
import { useAsyncOperation } from '../hooks/redux';
import type { UpdateProfileCommand } from '../domain/user/contracts';

interface ProfileFormData {
  phone: string;
  house: string;
}

export function ProfileDashboard() {
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

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    phone: '',
    house: ''
  });

  const updateOperation = useAsyncOperation<void>();

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        house: profile.house || ''
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        house: profile.house || ''
      });
    }
  };

  const handleSave = async () => {
    const command: UpdateProfileCommand = {
      phone: formData.phone || undefined,
      house: formData.house || undefined
    };

    await updateOperation.execute(async () => {
      await updateProfile(command);
      setIsEditing(false);
    });
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="profile-dashboard loading">
        <div className="spinner">Loading your profile...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-dashboard error">
        <div className="error-message">
          <h3>Unable to load profile</h3>
          <p>{error}</p>
          <button onClick={clearProfileError} className="btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No profile state
  if (!profile) {
    return (
      <div className="profile-dashboard empty">
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Welcome back, {fullName}!</h1>
        {profile.isAdmin && (
          <span className="admin-badge">Administrator</span>
        )}
      </header>

      {/* Profile Information */}
      <section className="profile-section">
        <div className="section-header">
          <h2>Profile Information</h2>
          {!isEditing ? (
            <button onClick={handleEdit} className="btn-primary">
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                onClick={handleSave} 
                disabled={updateOperation.isLoading}
                className="btn-success"
              >
                {updateOperation.isLoading ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={handleCancel}
                disabled={updateOperation.isLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-details">
          <div className="field">
            <label>Email:</label>
            <span>{profile.email}</span>
          </div>

          <div className="field">
            <label>Phone:</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="form-input"
              />
            ) : (
              <span>{profile.phone || 'Not provided'}</span>
            )}
          </div>

          <div className="field">
            <label>House:</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.house}
                onChange={(e) => handleInputChange('house', e.target.value)}
                placeholder="Enter house information"
                className="form-input"
              />
            ) : (
              <span>{profile.house || 'Not provided'}</span>
            )}
          </div>
        </div>

        {updateOperation.error && (
          <div className="error-message">
            Failed to update profile: {updateOperation.error}
          </div>
        )}
      </section>

      {/* Items Section */}
      <section className="items-section">
        <h2>Your Items ({itemsCount})</h2>
        
        {items.length === 0 ? (
          <div className="empty-state">
            <p>You haven't posted any items yet.</p>
            <button className="btn-primary">Post Your First Item</button>
          </div>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div key={item.itemId} className="item-card">
                {item.thumbnailUrl && (
                  <img 
                    src={item.thumbnailUrl} 
                    alt={item.title}
                    className="item-thumbnail"
                  />
                )}
                <div className="item-content">
                  <h3>{item.title}</h3>
                  {item.price && (
                    <p className="item-price">${item.price.toFixed(2)}</p>
                  )}
                  <p className="item-status">Status: {item.statusId}</p>
                  <p className="item-date">
                    Posted: {item.postedDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="item-actions">
                  <button className="btn-secondary">Edit</button>
                  <button className="btn-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Styles (would normally be in a separate CSS file)
 */
export const profileDashboardStyles = `
.profile-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.admin-badge {
  background: #2196f3;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.profile-section, .items-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.profile-details {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
}

.field label {
  font-weight: 500;
  color: #555;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.item-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.item-thumbnail {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-primary {
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-success {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading .spinner {
  text-align: center;
  padding: 40px;
  color: #666;
}
`;

/*
 * Architecture Benefits Demonstrated:
 * 
 * 1. Clean Architecture Layers:
 *    - Domain: UserProfile, UpdateProfileCommand contracts
 *    - Application: Redux slice with business logic
 *    - Infrastructure: API client, repositories
 *    - Presentation: React component with UI logic
 * 
 * 2. Dependency Injection:
 *    - Services injected via Redux thunk extra argument
 *    - No direct service imports in UI components
 *    - Easy to test with mocked services
 * 
 * 3. Type Safety:
 *    - Full TypeScript coverage
 *    - Compile-time validation
 *    - IntelliSense support
 * 
 * 4. Separation of Concerns:
 *    - UI logic separate from business logic
 *    - State management isolated in Redux
 *    - API calls abstracted behind repository pattern
 * 
 * 5. SOLID Principles:
 *    - SRP: Each component has single responsibility
 *    - OCP: Easy to extend without modification
 *    - DIP: Depends on abstractions, not concretions
 */