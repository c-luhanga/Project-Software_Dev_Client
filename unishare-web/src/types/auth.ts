// Base interfaces following Single Responsibility Principle
export interface BaseCredentials {
  email: string;
  password: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
}

export interface UserIdentity {
  userId: number;
  email: string;
}

export interface UserProfile {
  phone?: string;
  house?: string;
  profileImageUrl?: string;
}

export interface UserPermissions {
  isAdmin: boolean;
}

// Authentication request interfaces
export interface LoginRequest extends BaseCredentials {}

export interface RegisterRequest extends PersonalInfo, BaseCredentials {}

// Authentication response interfaces
export interface AuthToken {
  token: string;
}

export interface LoginResponse extends AuthToken, UserIdentity {
  name: string;
}

// User interfaces following Interface Segregation Principle
export interface BaseUser extends UserIdentity, PersonalInfo {}

export interface FullUserProfile extends BaseUser, UserProfile, UserPermissions {}

// Type aliases for common use cases
export type User = FullUserProfile;
export type PublicUser = Omit<BaseUser, 'email'>; // For public displays
export type AdminUser = BaseUser & Required<UserPermissions>;