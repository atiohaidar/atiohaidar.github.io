/**
 * @file Reusable Input component
 * Standardizes form input styling
 */
import React from 'react';
import { DASHBOARD_THEME } from '../../utils/styles';
import { useTheme } from '../../contexts/ThemeContext';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];
  
  const inputStyles = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : palette.input;

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium ${palette.panel.text} mb-1`}>
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${inputStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className={`mt-1 text-sm ${palette.panel.textMuted}`}>{helperText}</p>
      )}
    </div>
  );
};
