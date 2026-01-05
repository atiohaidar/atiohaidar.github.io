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
  variant?: 'default' | 'glass' | 'outlined';
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  variant = 'default',
  fullWidth = true, // Default to true as it was implicitly w-full before
  ...props
}) => {
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];

  let inputBaseStyle = '';
  // Base structural styles
  const baseStructure = 'px-4 py-3 shadow-sm focus:outline-none focus:ring-2 transition-all font-medium font-patrick text-lg';
  // Border styles per variant
  if (variant === 'glass' || variant === 'default') {
    // Notebook style: Bottom border only, transparent background
    inputBaseStyle = `bg-transparent border-b-2 border-slate-800 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:border-ink-blue dark:focus:border-chalk-blue rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 ${baseStructure}`;
  } else if (variant === 'outlined') {
    // Full border box
    inputBaseStyle = `bg-white dark:bg-slate-800 border-2 border-slate-800 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-marker-blue/50 ${baseStructure}`;
  } else {
    inputBaseStyle = `${palette.input} ${baseStructure} rounded-lg border-2`;
  }

  const errorStyle = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : '';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyle}`}>
      {label && (
        <label className={`block text-lg font-bold font-patrick ${variant === 'glass' || variant === 'default' ? 'text-slate-900 dark:text-white' : palette.panel.text} mb-2`}>
          {label}
        </label>
      )}
      <input
        className={`${widthStyle} ${inputBaseStyle} ${errorStyle} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 font-caveat">{error}</p>
      )}
      {helperText && !error && (
        <p className={`mt-1 text-sm ${palette.panel.textMuted} font-caveat`}>{helperText}</p>
      )}
    </div>
  );
};
