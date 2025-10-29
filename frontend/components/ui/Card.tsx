/**
 * @file Reusable Card component
 * Standardizes card styling across the application
 */
import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const hoverStyle = hover ? 'hover:shadow-lg transition-shadow' : '';
  
  return (
    <div className={`bg-white rounded-lg shadow ${paddingStyles[padding]} ${hoverStyle} ${className}`}>
      {children}
    </div>
  );
};
