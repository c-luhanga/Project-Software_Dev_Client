import React from 'react';
import AdminActions from './AdminActions';

/**
 * Example usage of AdminActions component
 * 
 * This demonstrates how the presentational AdminActions component
 * would be used by a container component that handles the business logic.
 */
const AdminActionsExample: React.FC = () => {
  const handleDeleteItem = () => {
    console.log('Delete item action triggered');
    // Container component would dispatch delete action
  };

  const handleBanUser = (userId: number) => {
    console.log('Ban user action triggered for user:', userId);
    // Container component would dispatch ban user action
  };

  const exampleUserId = 123;
  const isLoading = false;

  return (
    <div>
      <h3>Admin Actions Example</h3>
      <AdminActions
        onDeleteItem={handleDeleteItem}
        onBanUser={handleBanUser}
        userId={exampleUserId}
        disabled={isLoading}
      />
    </div>
  );
};

export default AdminActionsExample;