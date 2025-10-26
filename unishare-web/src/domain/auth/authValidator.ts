import type { LoginRequest, RegisterRequest } from '../../types/auth';
import type { IAuthValidator } from './IAuthService';
import { AuthValidationError } from './IAuthService';

/**
 * Auth validator implementation following Single Responsibility Principle
 * Handles all authentication-related validation logic
 */
export class AuthValidator implements IAuthValidator {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly minPasswordLength = 8;

  validateLogin(credentials: LoginRequest): void {
    this.validateEmail(credentials.email);
    this.validatePassword(credentials.password, 'password');
  }

  validateRegister(userData: RegisterRequest): void {
    this.validateEmail(userData.email);
    this.validatePassword(userData.password, 'password');
    this.validateName(userData.firstName, 'firstName');
    this.validateName(userData.lastName, 'lastName');
  }

  private validateEmail(email: string): void {
    if (!email || email.trim() === '') {
      throw new AuthValidationError('Email is required', 'email', 'REQUIRED');
    }

    if (!this.emailRegex.test(email)) {
      throw new AuthValidationError('Please enter a valid email address', 'email', 'INVALID_FORMAT');
    }
  }

  private validatePassword(password: string, field: string): void {
    if (!password) {
      throw new AuthValidationError('Password is required', field, 'REQUIRED');
    }

    if (password.length < this.minPasswordLength) {
      throw new AuthValidationError(
        `Password must be at least ${this.minPasswordLength} characters long`,
        field,
        'MIN_LENGTH'
      );
    }

    // Optional: Add more password complexity rules
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new AuthValidationError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        field,
        'COMPLEXITY'
      );
    }
  }

  private validateName(name: string, field: string): void {
    if (!name || name.trim() === '') {
      throw new AuthValidationError(
        `${field === 'firstName' ? 'First name' : 'Last name'} is required`,
        field,
        'REQUIRED'
      );
    }

    if (name.trim().length < 2) {
      throw new AuthValidationError(
        `${field === 'firstName' ? 'First name' : 'Last name'} must be at least 2 characters long`,
        field,
        'MIN_LENGTH'
      );
    }

    if (!/^[a-zA-Z\s-']+$/.test(name)) {
      throw new AuthValidationError(
        `${field === 'firstName' ? 'First name' : 'Last name'} can only contain letters, spaces, hyphens, and apostrophes`,
        field,
        'INVALID_CHARACTERS'
      );
    }
  }
}