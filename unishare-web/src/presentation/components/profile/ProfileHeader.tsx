/**
 * Profile Header Component
 * 
 * Presentational component following Single Responsibility Principle (SRP)
 * - Single responsibility: Display user profile header information
 * - No Redux dependencies
 * - No HTTP calls
 * - Pure UI component with props interface
 */

import type { UserProfile } from '../../../domain/user/contracts';

/**
 * Avatar component props following Interface Segregation Principle (ISP)
 * Only includes what's needed for avatar display
 */
interface AvatarProps {
  imageUrl?: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Profile Header props following ISP
 * Clean interface with only required data
 */
interface ProfileHeaderProps {
  profile: UserProfile;
  size?: 'compact' | 'full';
  showEmail?: boolean;
  className?: string;
}

/**
 * Avatar Component
 * Handles profile image display with fallback
 */
function Avatar({ imageUrl, alt, size = 'medium' }: AvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-16 h-16 text-sm',
    large: 'w-24 h-24 text-base'
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`rounded-full object-cover ${sizeClasses[size]}`}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium ${sizeClasses[size]}`}>
      {getInitials(alt)}
    </div>
  );
}

/**
 * Profile Header Component
 * Pure presentational component for displaying profile information
 */
export function ProfileHeader({ 
  profile, 
  size = 'full', 
  showEmail = true, 
  className = '' 
}: ProfileHeaderProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const avatarSize = size === 'compact' ? 'small' : 'large';

  if (size === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Avatar
          imageUrl={profile.profileImageUrl}
          alt={fullName}
          size={avatarSize}
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 truncate">
            {fullName}
          </h3>
          {showEmail && (
            <p className="text-sm text-gray-500 truncate">
              {profile.email}
            </p>
          )}
        </div>
        {profile.isAdmin && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Admin
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="mb-4 flex justify-center">
        <Avatar
          imageUrl={profile.profileImageUrl}
          alt={fullName}
          size={avatarSize}
        />
      </div>
      
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {fullName}
        </h1>
        
        {showEmail && (
          <p className="text-gray-600">
            {profile.email}
          </p>
        )}
        
        {profile.phone && (
          <p className="text-sm text-gray-500">
            📱 {profile.phone}
          </p>
        )}
        
        {profile.house && (
          <p className="text-sm text-gray-500">
            🏠 {profile.house}
          </p>
        )}
        
        {profile.isAdmin && (
          <div className="pt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Administrator
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Profile Header Skeleton Loading Component
 * Shows loading state while profile data is being fetched
 */
export function ProfileHeaderSkeleton({ size = 'full' }: { size?: 'compact' | 'full' }) {
  if (size === 'compact') {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="min-w-0 flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center animate-pulse">
      <div className="mb-4 flex justify-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
      </div>
    </div>
  );
}

/*
 * Component Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - ProfileHeader: Only displays profile information
 *    - Avatar: Only handles image/initials display
 *    - No business logic, API calls, or state management
 * 
 * 2. Interface Segregation Principle (ISP):
 *    - Clean props interfaces with only required data
 *    - Optional props for customization
 *    - No forced dependencies on unused features
 * 
 * 3. Pure Function Component:
 *    - Predictable output based on props
 *    - Easy to test with different prop combinations
 *    - No side effects or external dependencies
 * 
 * 4. Reusability:
 *    - Compact and full display modes
 *    - Configurable email display
 *    - Custom className support
 * 
 * 5. Accessibility:
 *    - Proper alt text for images
 *    - Semantic HTML structure
 *    - Screen reader friendly
 * 
 * Usage Examples:
 * 
 * // Full profile header
 * <ProfileHeader profile={userProfile} />
 * 
 * // Compact header without email
 * <ProfileHeader 
 *   profile={userProfile} 
 *   size="compact" 
 *   showEmail={false} 
 * />
 * 
 * // Loading state
 * <ProfileHeaderSkeleton size="full" />
 */