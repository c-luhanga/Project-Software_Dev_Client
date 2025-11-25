import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import type { RegisterRequest } from '../../../types/auth';

/**
 * Props interface for RegisterForm following Interface Segregation Principle
 * Only includes what the component needs to know
 */
export interface RegisterFormProps {
  /** Callback fired when form is submitted with valid data */
  onSubmit: (data: RegisterRequest) => void;
  /** Loading state to show progress indicator */
  loading?: boolean;
  /** Custom submit button text */
  submitButtonText?: string;
  /** Whether to disable the form */
  disabled?: boolean;
  /** Whether to show login link */
  showLoginLink?: boolean;
  /** Callback for login navigation */
  onLoginNavigation?: () => void;
}

/**
 * Pure presentational register form component following Single Responsibility Principle
 * 
 * Responsibilities:
 * - Render registration form UI with all required fields
 * - Handle form validation and user input
 * - Call onSubmit callback with form data
 * 
 * Does NOT:
 * - Access Redux store or services (SRP)
 * - Know how registration is implemented (ISP/DIP)
 * - Handle business logic or side effects
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading = false,
  submitButtonText = 'Create Account',
  disabled = false,
  showLoginLink = true,
  onLoginNavigation,
}) => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  /**
   * First name validation
   */
  const validateFirstName = (value: string): string => {
    if (!value.trim()) {
      return 'First name is required';
    }
    
    if (value.trim().length < 2) {
      return 'First name must be at least 2 characters';
    }
    
    if (!/^[a-zA-Z\s-']+$/.test(value)) {
      return 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    return '';
  };

  /**
   * Last name validation
   */
  const validateLastName = (value: string): string => {
    if (!value.trim()) {
      return 'Last name is required';
    }
    
    if (value.trim().length < 2) {
      return 'Last name must be at least 2 characters';
    }
    
    if (!/^[a-zA-Z\s-']+$/.test(value)) {
      return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    return '';
  };

  /**
   * Email validation
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
   * Password validation
   */
  const validatePassword = (value: string): string => {
    if (!value) {
      return 'Password is required';
    }
    
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    return '';
  };

  /**
   * Confirm password validation
   */
  const validateConfirmPassword = (value: string): string => {
    if (!value) {
      return 'Please confirm your password';
    }
    
    if (value !== password) {
      return 'Passwords do not match';
    }
    
    return '';
  };

  /**
   * Handle input change with validation
   */
  const handleInputChange = (
    field: keyof typeof errors,
    value: string,
    validator: (value: string) => string
  ) => {
    // Update field state
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        // Re-validate confirm password if it has been touched
        if (touched.confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(confirmPassword),
          }));
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
    // Validate if field has been touched
    if (touched[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: validator(value),
      }));
    }
  };

  /**
   * Handle field blur to trigger validation
   */
  const handleBlur = (field: keyof typeof errors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let validator: (value: string) => string;
    let value: string;
    
    switch (field) {
      case 'firstName':
        validator = validateFirstName;
        value = firstName;
        break;
      case 'lastName':
        validator = validateLastName;
        value = lastName;
        break;
      case 'email':
        validator = validateEmail;
        value = email;
        break;
      case 'password':
        validator = validatePassword;
        value = password;
        break;
      case 'confirmPassword':
        validator = validateConfirmPassword;
        value = confirmPassword;
        break;
      default:
        return;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: validator(value),
    }));
  };

  /**
   * Toggle password visibility
   */
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  /**
   * Toggle confirm password visibility
   */
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  /**
   * Handle form submission with validation
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    
    // Validate all fields
    const validationErrors = {
      firstName: validateFirstName(firstName),
      lastName: validateLastName(lastName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };
    
    setErrors(validationErrors);
    
    // Check if form is valid
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    
    if (!hasErrors) {
      onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
    }
  };

  /**
   * Check if form is valid
   */
  const isFormValid = 
    firstName.trim() && 
    lastName.trim() && 
    email.trim() && 
    password && 
    confirmPassword &&
    !Object.values(errors).some(error => error !== '');

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        width: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: { xs: 2, sm: 3 },
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
          Create Account
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Join UniShare to start sharing knowledge
        </Typography>

        {/* Name Fields */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <TextField
            fullWidth
            id="firstName"
            name="firstName"
            label="First Name"
            value={firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value, validateFirstName)}
            onBlur={() => handleBlur('firstName')}
            error={touched.firstName && Boolean(errors.firstName)}
            helperText={touched.firstName && errors.firstName}
            disabled={loading || disabled}
            autoComplete="given-name"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color={touched.firstName && errors.firstName ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            id="lastName"
            name="lastName"
            label="Last Name"
            value={lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value, validateLastName)}
            onBlur={() => handleBlur('lastName')}
            error={touched.lastName && Boolean(errors.lastName)}
            helperText={touched.lastName && errors.lastName}
            disabled={loading || disabled}
            autoComplete="family-name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color={touched.lastName && errors.lastName ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Email Field */}
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => handleInputChange('email', e.target.value, validateEmail)}
          onBlur={() => handleBlur('email')}
          error={touched.email && Boolean(errors.email)}
          helperText={touched.email && errors.email}
          disabled={loading || disabled}
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color={touched.email && errors.email ? 'error' : 'action'} />
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
          onChange={(e) => handleInputChange('password', e.target.value, validatePassword)}
          onBlur={() => handleBlur('password')}
          error={touched.password && Boolean(errors.password)}
          helperText={touched.password && errors.password}
          disabled={loading || disabled}
          autoComplete="new-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color={touched.password && errors.password ? 'error' : 'action'} />
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

        {/* Confirm Password Field */}
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value, validateConfirmPassword)}
          onBlur={() => handleBlur('confirmPassword')}
          error={touched.confirmPassword && Boolean(errors.confirmPassword)}
          helperText={touched.confirmPassword && errors.confirmPassword}
          disabled={loading || disabled}
          autoComplete="new-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color={touched.confirmPassword && errors.confirmPassword ? 'error' : 'action'} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleToggleConfirmPasswordVisibility}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={loading || disabled}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

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
          {loading ? 'Creating Account...' : submitButtonText}
        </Button>

        {/* Login Link */}
        {showLoginLink && onLoginNavigation && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button
                variant="text"
                size="small"
                onClick={onLoginNavigation}
                disabled={loading || disabled}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  p: 0,
                  minWidth: 'auto',
                }}
              >
                Sign in here
              </Button>
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default RegisterForm;