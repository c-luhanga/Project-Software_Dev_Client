/**
 * User Repository Implementation (Infrastructure Layer)
 * 
 * Implements IUserRepository contract using HTTP client abstraction
 * Follows Single Responsibility and Dependency Inversion Principles:
 * - SRP: Solely responsible for user data access via HTTP API
 * - DIP: Depends on IApiClient abstraction, not concrete HTTP implementation
 * - No UI logic, Redux, or framework dependencies
 */

import type { IApiClient } from '../http/IApiClient';
import type { 
  IUserRepository, 
  UserProfile, 
  UpdateProfileCommand, 
  ItemSummary 
} from '../../domain/user/contracts';
import { AuthenticationError, ApiError } from '../http/IApiClient';

/**
 * HTTP-based implementation of IUserRepository
 * Pure data access layer with no business logic or UI concerns
 */
export class UserRepository implements IUserRepository {
  private readonly apiClient: IApiClient;

  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get current user's profile
   * @returns Promise resolving to user profile
   * @throws Error if user not found or unauthorized
   */
  async getMe(): Promise<UserProfile> {
    try {
      // Call API endpoint for current user profile
      const response = await this.apiClient.get<ApiUserProfile>('/users/me');
      
      // Map API response to domain UserProfile
      return this.mapToUserProfile(response);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new Error('Authentication required to access profile');
      }
      if (error instanceof ApiError) {
        throw new Error(`Failed to retrieve profile: ${error.message}`);
      }
      throw new Error('Unexpected error retrieving profile');
    }
  }

  /**
   * Update current user's profile
   * @param command Update profile command with new values
   * @throws Error if validation fails or update not permitted
   */
  async updateMe(command: UpdateProfileCommand): Promise<void> {
    try {
      // Send update command to API
      await this.apiClient.put<void>('/users/me', command);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new Error('Authentication required to update profile');
      }
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error(`Invalid profile data: ${error.message}`);
        }
        if (error.status === 403) {
          throw new Error('Not authorized to update this profile');
        }
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      throw new Error('Unexpected error updating profile');
    }
  }

  /**
   * Get current user's items
   * @returns Promise resolving to array of item summaries
   * @throws Error if unauthorized or fetch fails
   */
  async getMyItems(): Promise<ItemSummary[]> {
    try {
      // Use the correct backend endpoint for getting current user's items
      const response = await this.apiClient.get<ApiItemSummary[]>('/items/my-items');

      // Map API response to domain ItemSummary[]
      return response.map(this.mapToItemSummary);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new Error('Authentication required to access your items');
      }
      if (error instanceof ApiError) {
        // Temporary workaround: return empty array for 400 errors while backend is being debugged
        if (error.status === 400) {
          console.warn('Backend /items/my-items returning 400 - returning empty array temporarily');
          return [];
        }
        throw new Error(`Failed to retrieve your items: ${error.message}`);
      }
      throw new Error('Unexpected error retrieving your items');
    }
  }

  /**
   * Map API user profile response to domain UserProfile
   * Handles field mapping and type conversion
   */
  private mapToUserProfile(apiUser: ApiUserProfile): UserProfile {
    const userId = apiUser.userId ?? apiUser.id ?? apiUser.userID;
    if (!userId) {
      throw new Error('Invalid user profile: missing user ID');
    }

    return {
      userId,
      firstName: apiUser.firstName || '',
      lastName: apiUser.lastName || '',
      email: apiUser.email || '',
      phone: apiUser.phone || undefined,
      house: apiUser.house || undefined,
      profileImageUrl: apiUser.profileImageUrl || undefined,
      isAdmin: apiUser.isAdmin || false,
      createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : undefined,
      lastSeen: apiUser.lastSeen ? new Date(apiUser.lastSeen) : undefined,
    };
  }

  /**
   * Map API item response to domain ItemSummary
   * Handles field mapping and type conversion
   */
  private mapToItemSummary(apiItem: ApiItemSummary): ItemSummary {
    const itemId = apiItem.id ?? apiItem.itemId;
    if (!itemId) {
      throw new Error('Invalid item: missing item ID');
    }

    const dateString = apiItem.postedDate || apiItem.createdAt;
    if (!dateString) {
      throw new Error('Invalid item: missing posted date');
    }

    return {
      itemId,
      title: apiItem.title || '',
      price: apiItem.price || undefined,
      statusId: apiItem.statusId || 0,
      postedDate: new Date(dateString),
      thumbnailUrl: apiItem.thumbnailUrl || apiItem.imageUrl || undefined,
    };
  }
}

/**
 * API Response Types (Infrastructure Concerns)
 * These represent the actual API contract, separate from domain models
 */
interface ApiUserProfile {
  userId?: number;
  id?: number;
  userID?: number; // Handle backend inconsistencies
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  house?: string;
  profileImageUrl?: string;
  isAdmin?: boolean;
  createdAt?: string;
  lastSeen?: string;
}

interface ApiItemSummary {
  id?: number;
  itemId?: number;
  title?: string;
  price?: number;
  statusId?: number;
  postedDate?: string;
  createdAt?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
}