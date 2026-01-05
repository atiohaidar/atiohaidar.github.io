/**
 * @file Divider component for separating content sections
 * Supports solid, dashed, and dotted variants in the hand-drawn notebook style
 */
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface DividerProps {
    variant?: 'solid' | 'dashed' | 'dotted';
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    color?: 'default' | 'accent' | 'muted';
    thickness?: 'thin' | 'normal' | 'thick';
}

const thicknessMap = {
    thin: 'border',
    normal: 'border-2',
    thick: 'border-4',
};

const colorMapLight = {
    default: 'border-slate-300',
    accent: 'border-accent-blue/50',
    muted: 'border-slate-200',
};

const colorMapDark = {
    default: 'border-slate-600',
    accent: 'border-accent-blue/30',
    muted: 'border-slate-700',
};

export const Divider: React.FC<DividerProps> = ({
    variant = 'solid',
    orientation = 'horizontal',
    className = '',
    color = 'default',
    thickness = 'normal',
}) => {
    const { theme } = useTheme();
    const colorMap = theme === 'dark' ? colorMapDark : colorMapLight;

    const variantStyles = {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted',
    };

    const orientationStyles = orientation === 'horizontal'
        ? `w-full border-t-0 ${thicknessMap[thickness].replace('border', 'border-b')} h-0`
        : `h-full border-l-0 ${thicknessMap[thickness].replace('border', 'border-r')} w-0`;

    return (
        <div
            className={`${orientationStyles} ${variantStyles[variant]} ${colorMap[color]} ${className}`}
            role="separator"
            aria-orientation={orientation}
        />
    );
};

export default Divider;
