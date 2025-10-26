import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import type { LoginRequest } from '../../../types/auth';

/**
 * Props interface for LoginForm following Interface Segregation Principle
 * Only includes what the component needs to know
 */
export interface LoginFormProps {
  /** Callback fired when form is submitted with valid credentials */
  onSubmit: (credentials: LoginRequest) => void;
  /** Loading state to show progress indicator */
  loading?: boolean;
  /** Whether to show the forgot password link */
  showForgotPassword?: boolean;
  /** Callback for forgot password action */
  onForgotPassword?: () => void;
  /** Custom submit button text */
  submitButtonText?: string;
  /** Whether to disable the form */
  disabled?: boolean;
}

/**
 * Pure presentational login form component following Single Responsibility Principle
 * 
 * Responsibilities:
 * - Render login form UI with email and password fields
 * - Handle form validation and user input
 * - Call onSubmit callback with form data
 * 
 * Does NOT:
 * - Access Redux store or services (SRP)
 * - Know how authentication is implemented (ISP/DIP)
 * - Handle business logic or side effects
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  showForgotPassword = true,
  onForgotPassword,
  submitButtonText = 'Sign In',
  disabled = false,
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  /**
   * Email validation following business rules
   */
  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return 'Email is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    
    return '';
  };

  /**
   * Password validation following business rules
   */
  const validatePassword = (value: string): string => {
    if (!value) {
      return 'Password is required';
    }
    
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    
    return '';
  };

  /**
   * Handle email input change with validation
   */
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    
    if (touched.email) {
      setEmailError(validateEmail(value));
    }
  };

  /**
   * Handle password input change with validation
   */
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
    
    if (touched.password) {
      setPasswordError(validatePassword(value));
    }
  };

  /**
   * Handle field blur to trigger validation
   */
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      setEmailError(validateEmail(email));
    } else {
      setPasswordError(validatePassword(password));
    }
  };

  /**
   * Toggle password visibility
   */
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  /**
   * Handle form submission with validation
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    
    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    
    // Only submit if no validation errors
    if (!emailValidationError && !passwordValidationError) {
      onSubmit({ email: email.trim(), password });
    }
  };

  /**
   * Check if form is valid
   */
  const isFormValid = email.trim() && password && !emailError && !passwordError;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        maxWidth: 400,
        width: '100%',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 3 }}
        >
          Welcome Back
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Sign in to your account to continue
        </Typography>

        {/* Email Field */}
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => handleBlur('email')}
          error={touched.email && Boolean(emailError)}
          helperText={touched.email && emailError}
          disabled={loading || disabled}
          autoComplete="email"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color={touched.email && emailError ? 'error' : 'action'} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Password Field */}
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => handleBlur('password')}
          error={touched.password && Boolean(passwordError)}
          helperText={touched.password && passwordError}
          disabled={loading || disabled}
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color={touched.password && passwordError ? 'error' : 'action'} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={loading || disabled}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Forgot Password Link */}
        {showForgotPassword && onForgotPassword && (
          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Button
              variant="text"
              size="small"
              onClick={onForgotPassword}
              disabled={loading || disabled}
              sx={{ textTransform: 'none' }}
            >
              Forgot password?
            </Button>
          </Box>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={!isFormValid || loading || disabled}
          sx={{
            py: 1.5,
            mb: 2,
            fontWeight: 600,
          }}
        >
          {loading ? 'Signing In...' : submitButtonText}
        </Button>

        {/* Additional Actions */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Button
              variant="text"
              size="small"
              disabled={loading || disabled}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                p: 0,
                minWidth: 'auto',
              }}
            >
              Sign up
            </Button>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;