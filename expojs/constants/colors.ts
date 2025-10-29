/**
 * Centralized Color Configuration
 * All colors used throughout the app should be defined here for consistency
 * This allows easy theme management and color updates
 */

export const AppColors = {
  // Primary Brand Colors
  primary: '#6200ee',
  primaryLight: '#bb86fc',
  primaryDark: '#3700b3',
  primaryContainer: '#bb86fc',
  
  // Secondary/Accent Colors
  secondary: '#03dac6',
  secondaryLight: '#66fff9',
  secondaryDark: '#00a896',
  secondaryContainer: '#018786',
  
  // Background Colors
  backgroundLight: '#f5f5f5',
  backgroundDark: '#121212',
  surfaceLight: '#ffffff',
  surfaceDark: '#1e1e1e',
  
  // Text Colors
  textPrimaryLight: '#000000',
  textPrimaryDark: '#ffffff',
  textSecondaryLight: '#666666',
  textSecondaryDark: '#b3b3b3',
  
  // Status Colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#b00020',
  errorDark: '#cf6679',
  info: '#2196f3',
  
  // UI Element Colors
  border: '#e0e0e0',
  borderDark: '#333333',
  divider: '#e0e0e0',
  dividerDark: '#2c2c2c',
  
  // Functional Colors
  disabled: '#9e9e9e',
  placeholder: '#9e9e9e',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Stat Card Colors
  statBlue: '#2196F3',
  statGreen: '#4CAF50',
  statOrange: '#FF9800',
  statPurple: '#9C27B0',
  statRed: '#F44336',
  
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
