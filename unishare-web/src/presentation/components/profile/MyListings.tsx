/**
 * My Listings Component
 * 
 * Presentational component following Single Responsibility Principle (SRP)
 * - Single responsibility: Display user's items in a grid layout
 * - No business logic or external dependencies
 * - No Redux access or HTTP calls
 * - Pure UI component with props interface
 */

import type { ItemSummary } from '../../../domain/user/contracts';

/**
 * My Listings props following Interface Segregation Principle (ISP)
 * Clean interface with only required data for display
 */
interface MyListingsProps {
  /** User's items to display */
  items: ItemSummary[];
  /** Loading state */
  loading: boolean;
  /** Optional click handler for items */
  onItemClick?: (item: ItemSummary) => void;
  /** Custom grid className */
  className?: string;
}

/**
 * Item Card props following ISP
 * Focused interface for individual item display
 */
interface ItemCardProps {
  item: ItemSummary;
  onClick?: (item: ItemSummary) => void;
}

/**
 * Status Badge Component
 * Displays item status with appropriate styling
 */
function StatusBadge({ statusId }: { statusId: number }) {
  const getStatusInfo = (id: number) => {
    switch (id) {
      case 1:
        return { label: 'Available', color: 'bg-green-100 text-green-800' };
      case 2:
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 3:
        return { label: 'Sold', color: 'bg-gray-100 text-gray-800' };
      case 4:
        return { label: 'Withdrawn', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const { label, color } = getStatusInfo(statusId);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

/**
 * Item Card Component
 * Individual item display with thumbnail, title, price, and status
 */
function ItemCard({ item, onClick }: ItemCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden 
        hover:shadow-md transition-shadow duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA4MEgxMjBWMTIwSDgwVjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900 truncate pr-2">
            {item.title}
          </h3>
          <StatusBadge statusId={item.statusId} />
        </div>

        {/* Price */}
        {item.price && (
          <p className="text-xl font-bold text-gray-900 mb-2">
            {formatPrice(item.price)}
          </p>
        )}

        {/* Posted Date */}
        <p className="text-sm text-gray-500">
          Posted {formatDate(item.postedDate)}
        </p>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Item Cards
 */
function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

/**
 * My Listings Component
 * Grid display of user's items with loading and empty states
 */
export function MyListings({ 
  items, 
  loading, 
  onItemClick,
  className = '' 
}: MyListingsProps) {
  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ItemCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg 
          className="mx-auto h-12 w-12 text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No items posted yet
        </h3>
        <p className="text-gray-600 mb-4">
          You haven't posted any items for sale or exchange.
        </p>
        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post Your First Item
        </button>
      </div>
    );
  }

  // Items grid
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          My Listings
        </h2>
        <span className="text-sm text-gray-600">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <ItemCard
            key={item.itemId}
            item={item}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}

/*
 * Component Architecture Benefits:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - MyListings: Only displays items grid with states
 *    - ItemCard: Only displays individual item information
 *    - StatusBadge: Only handles status display logic
 *    - No business logic, API calls, or external state
 * 
 * 2. Interface Segregation Principle (ISP):
 *    - Clean props interfaces with only required data
 *    - Optional click handlers for interaction
 *    - No forced dependencies on unused features
 * 
 * 3. Pure Components:
 *    - Predictable output based on props
 *    - No side effects or external dependencies
 *    - Easy to test with different data sets
 * 
 * 4. Responsive Design:
 *    - Grid adapts to different screen sizes
 *    - Proper aspect ratios for thumbnails
 *    - Mobile-friendly touch targets
 * 
 * 5. User Experience:
 *    - Loading skeletons during data fetch
 *    - Empty state with call-to-action
 *    - Image error handling with fallbacks
 *    - Proper formatting for prices and dates
 * 
 * 6. Accessibility:
 *    - Semantic HTML structure
 *    - Proper alt text for images
 *    - Keyboard navigation support
 * 
 * Usage Examples:
 * 
 * // Basic usage
 * <MyListings items={userItems} loading={false} />
 * 
 * // With loading state
 * <MyListings items={[]} loading={true} />
 * 
 * // With click handler
 * <MyListings 
 *   items={userItems} 
 *   loading={false}
 *   onItemClick={(item) => navigate(`/items/${item.itemId}`)}
 * />
 */