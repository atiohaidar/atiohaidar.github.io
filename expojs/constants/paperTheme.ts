import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { AppColors } from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: AppColors.primary,
    primaryContainer: AppColors.primaryContainer,
    secondary: AppColors.secondary,
    secondaryContainer: AppColors.secondaryContainer,
    background: AppColors.backgroundLight,
    surface: AppColors.surfaceLight,
    error: AppColors.error,
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onBackground: AppColors.textPrimaryLight,
    onSurface: AppColors.textPrimaryLight,
    onError: '#ffffff',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: AppColors.primaryLight,
    primaryContainer: AppColors.primary,
    secondary: AppColors.secondary,
    secondaryContainer: AppColors.secondaryContainer,
    background: AppColors.backgroundDark,
    surface: AppColors.surfaceDark,
    surfaceVariant: 'rgba(255, 255, 255, 0.05)', // For improved card contrast
    error: AppColors.errorDark,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: AppColors.textPrimaryDark,
    onSurface: AppColors.textPrimaryDark,
    onError: '#FFFFFF',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: 'rgba(30, 30, 30, 0.4)',
      level2: 'rgba(30, 30, 30, 0.6)',
    }
  },
};
