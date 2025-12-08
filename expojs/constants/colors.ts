/**
 * Centralized Color Configuration
 * All colors used throughout the app should be defined here for consistency
 * This allows easy theme management and color updates
 */

export const AppColors = {
  // Primary Brand Colors (Mapped from Web)
  primary: '#2563EB', // accent-blue
  primaryLight: '#60A5FA',
  primaryDark: '#1E40AF',
  primaryContainer: '#2563EB',

  // Secondary/Accent Colors
  secondary: '#494949', // light-navy
  secondaryLight: '#AAAAAA', // soft-gray
  secondaryDark: '#222222', // deep-navy
  secondaryContainer: '#494949',

  // Background Colors
  backgroundLight: '#F5F5F5', // light-bg
  backgroundDark: '#222222', // deep-navy
  surfaceLight: '#FFFFFF', // light-card
  surfaceDark: 'rgba(30, 30, 30, 0.6)', // glass effect base

  // Text Colors
  textPrimaryLight: '#1F2937', // light-text
  textPrimaryDark: '#FFFFFF',
  textSecondaryLight: '#6B7280', // light-muted
  textSecondaryDark: '#D0D0D0', // light-slate

  // Status Colors (Kept vibrant)
  success: '#1AAE6F',
  warning: '#FBBF24',
  error: '#FF6B6B',
  errorDark: '#C44545',
  info: '#2563EB',

  // UI Element Colors
  border: '#E5E7EB',
  borderDark: 'rgba(255, 255, 255, 0.1)',
  divider: '#E5E7EB',
  dividerDark: 'rgba(255, 255, 255, 0.1)',

  // Functional Colors
  disabled: '#9CA3AF',
  placeholder: '#9CA3AF',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Stat Card Colors (Updated to richer tones)
  statBlue: '#2563EB',
  statGreen: '#1AAE6F',
  statOrange: '#F59E0B',
  statPurple: '#7C3AED',
  statRed: '#EF4444',

  // Transparent
  transparent: 'transparent',
};

// Dark mode colors object for easy switching
export const DarkColors = {
  background: AppColors.backgroundDark,
  surface: AppColors.surfaceDark,
  text: AppColors.textPrimaryDark,
  textSecondary: AppColors.textSecondaryDark,
  border: AppColors.borderDark,
  divider: AppColors.dividerDark,
};

// Light mode colors object for easy switching
export const LightColors = {
  background: AppColors.backgroundLight,
  surface: AppColors.surfaceLight,
  text: AppColors.textPrimaryLight,
  textSecondary: AppColors.textSecondaryLight,
  border: AppColors.border,
  divider: AppColors.divider,
};
