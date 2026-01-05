/**
 * @file Reusable Button component
 * Standardizes button styling across the application
 */
import React from 'react';

export interface ButtonProps extends Omit<React.AllHTMLAttributes<HTMLElement>, 'as' | 'size'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'gradient' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  as?: React.ElementType;
  to?: any;
}

const variantStyles = {
  primary: 'bg-marker-blue text-slate-900 border-2 border-slate-800 hover:bg-blue-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  secondary: 'bg-white text-slate-900 border-2 border-slate-800 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  danger: 'bg-marker-pink text-slate-900 border-2 border-slate-800 hover:bg-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  success: 'bg-marker-green text-slate-900 border-2 border-slate-800 hover:bg-green-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  gradient: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30',
  glass: 'glass-button',
  ghost: 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  as: Component = 'button',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center'; // Added flex centering for consistency
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </Component>
  );
};
