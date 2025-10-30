import type { IApiClient } from '../http/IApiClient';
import type { IAuthRepository } from './IAuthRepository';
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  User 
} from '../../types/auth';

/**
 * Raw API response interfaces (infrastructure layer)
 * These represent the actual HTTP response structure from the server
 */
interface ApiLoginResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
}

interface ApiUserResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  house?: string;
  profileImageUrl?: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  lastSeen?: string;
}

interface ApiRegisterResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
}

/**
 * Auth repository implementation following Single Responsibility Principle
 * Responsible only for auth-related HTTP operations and data mapping
 * Uses Dependency Inversion by depending on IApiClient abstraction
 */
export class AuthRepository implements IAuthRepository {
  private readonly apiClient: IApiClient;
  private readonly baseEndpoint = '/auth';

  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.apiClient.post<ApiLoginResponse>(
        `${this.baseEndpoint}/login`,
        credentials
      );

      return this.mapLoginResponse(response);
    } catch (error) {
      // Let the API client handle error normalization
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await this.apiClient.post<ApiRegisterResponse>(
        `${this.baseEndpoint}/register`,
        userData
      );

      return this.mapLoginResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async getMe(): Promise<User> {
    try {
      const response = await this.apiClient.get<ApiUserResponse>(
        '/users/me'
      );

      return this.mapUserResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await this.apiClient.post<ApiLoginResponse>(
        `${this.baseEndpoint}/refresh`
      );

      return this.mapLoginResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post(`${this.baseEndpoint}/logout`);
      
      // Clear token from API client after successful server logout
      this.apiClient.setToken(null);
    } catch (error) {
      // Even if server logout fails, clear local token
      this.apiClient.setToken(null);
      throw error;
    }
  }

  /**
   * Maps raw API login response to domain LoginResponse DTO
   * Encapsulates the transformation logic for login responses
   */
  private mapLoginResponse(apiResponse: ApiLoginResponse | ApiRegisterResponse): LoginResponse {
    return {
      token: apiResponse.token,
      userId: apiResponse.userId,
      email: apiResponse.email,
      name: apiResponse.name,
    };
  }

  /**
   * Maps raw API user response to domain User DTO
   * Encapsulates the transformation logic for user data
   */
  private mapUserResponse(apiResponse: ApiUserResponse): User {
    return {
      userId: apiResponse.userId,
      firstName: apiResponse.firstName,
      lastName: apiResponse.lastName,
      email: apiResponse.email,
      phone: apiResponse.phone,
      house: apiResponse.house,
      profileImageUrl: apiResponse.profileImageUrl,
      isAdmin: apiResponse.isAdmin,
      isBanned: apiResponse.isBanned,
      createdAt: apiResponse.createdAt ? new Date(apiResponse.createdAt) : undefined,
      lastSeen: apiResponse.lastSeen ? new Date(apiResponse.lastSeen) : undefined,
    };
  }
}

/**
 * Factory function to create AuthRepository instance
 * Promotes loose coupling and easier testing
 */
export const createAuthRepository = (apiClient: IApiClient): IAuthRepository => {
  return new AuthRepository(apiClient);
};