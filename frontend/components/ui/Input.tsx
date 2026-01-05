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
  variant?: 'default' | 'glass';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  variant = 'default',
  ...props
}) => {
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];

  let inputBaseStyle = '';
  if (variant === 'glass' || variant === 'default') {
    // Notebook style input: transparent bg, bottom border (or full border depending on pref, but based on TicketSubmissionSection it was border-b-2)
    // Actually TicketSubmissionSection used border-b-2. Let's make that the 'underline' variant and default to standard box but with hand-drawn feel?
    // Let's stick to what was in Hero/Ticket: border-2 border-slate-800 ...
    // Wait, TicketSubmissionSection used: `bg-transparent border-b-2 ${COLORS.BORDER}`
    // Let's make 'glass' be the "notebook" style.
    inputBaseStyle = 'bg-transparent border-b-2 border-slate-800 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:border-ink-blue dark:focus:border-chalk-blue rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-patrick';
  } else {
    inputBaseStyle = palette.input;
  }

  const errorStyle = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : '';

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium ${variant === 'glass' ? 'text-gray-700 dark:text-gray-300' : palette.panel.text} mb-1 ml-1`}>
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all font-medium ${inputBaseStyle} ${errorStyle} ${className}`}
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
