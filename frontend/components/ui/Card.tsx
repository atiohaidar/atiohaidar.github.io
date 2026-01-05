/**
 * @file Reusable Card component
 * Standardizes card styling across the application
 */
import React from 'react';
import { DASHBOARD_THEME } from '../../utils/styles';
import { useTheme } from '../../contexts/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  variant?: 'default' | 'glass' | 'outlined';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  variant = 'default',
}) => {
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];

  const hoverStyle = hover ? 'hover:shadow-lg transition-transform duration-200 hover:-translate-y-1' : '';

  let variantStyles = '';
  switch (variant) {
    case 'glass':
      variantStyles = 'glass-card';
      break;
    case 'outlined':
      variantStyles = `bg-transparent border-2 border-dashed ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`;
      break;
    case 'default':
    default:
      variantStyles = `${palette.panel.bg} shadow-sm ${palette.panel.border}`;
      break;
  }

  return (
    <div className={`rounded-xl ${paddingStyles[padding]} ${variantStyles} ${hoverStyle} ${className}`}>
      {children}
    </div>
  );
};
