import { useColorScheme } from './use-color-scheme';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  disabled: string;
  error: string;
  success: string;
  warning: string;
}

const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  primary: '#1976d2',
  text: '#000000',
  textSecondary: '#666666',
  disabled: '#cccccc',
  error: '#d32f2f',
  success: '#388e3c',
  warning: '#f57c00',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#90caf9',
  text: '#ffffff',
  textSecondary: '#bbbbbb',
  disabled: '#555555',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  return { colors };
};
