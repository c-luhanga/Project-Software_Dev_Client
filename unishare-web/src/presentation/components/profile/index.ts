/**
 * Profile Components Index
 * 
 * Exports all profile-related presentational components
 * following clean architecture principles
 */

export { ProfileHeader, ProfileHeaderSkeleton } from './ProfileHeader';
export { ProfileEditForm } from './ProfileEditForm';
export { MyListings } from './MyListings';

// Re-export types for convenience
export type { UserProfile, UpdateProfileCommand, ItemSummary } from '../../../domain/user/contracts';