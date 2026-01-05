/**
 * @file Reusable Loading component
 * Standardizes loading states
 */
import React from 'react';
import { DASHBOARD_THEME } from '../../utils/styles';
import { useTheme } from '../../contexts/ThemeContext';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text }) => {
  const { theme } = useTheme();

  // Hand-drawn spinner: A dashed border circle that spins
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`
          animate-spin rounded-full 
          border-4 border-dashed 
          border-slate-300 dark:border-slate-600 
          border-t-marker-blue dark:border-t-blue-400
          ${theme === 'light' ? 'opacity-80' : 'opacity-90'}
          ${sizeStyles[size]}
        `}
        style={{
          borderRadius: '50% 45% 55% 40% / 40% 55% 45% 50%' // Irregular hand-drawn circle shape
        }}
      />
      {text && (
        <p className="mt-3 text-lg font-caveat text-slate-600 dark:text-slate-400 font-bold tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
