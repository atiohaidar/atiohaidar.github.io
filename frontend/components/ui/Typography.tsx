import React from 'react';
import { COLORS } from '../../utils/styles';

type TypographyVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'body'
    | 'small'
    | 'caption'
    | 'nav';

interface TypographyProps extends Omit<React.AllHTMLAttributes<HTMLElement>, 'as'> {
    variant?: TypographyVariant;
    as?: React.ElementType;
    className?: string;
    children?: React.ReactNode;
    accent?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body',
    as,
    className = '',
    children,
    accent = false,
    ...props
}) => {
    const baseStyles = " transition-colors duration-200";

    const variants = {
        h1: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-caveat",
        h2: "text-2xl sm:text-3xl lg:text-4xl font-bold font-caveat",
        h3: "text-xl md:text-2xl font-bold font-caveat",
        h4: "text-lg font-bold font-caveat",
        body: "text-base sm:text-lg leading-relaxed", // Slightly adjusted body for better readability
        small: "text-sm",
        caption: "text-xs",
        nav: "text-base font-bold"
    };

    const defaultColors = {
        h1: "text-slate-900 dark:text-white",
        h2: "text-slate-900 dark:text-white",
        h3: "text-slate-900 dark:text-white",
        h4: "text-slate-900 dark:text-white",
        body: "text-slate-700 dark:text-slate-300",
        small: "text-slate-600 dark:text-slate-400",
        caption: "text-slate-500 dark:text-slate-500",
        nav: `${COLORS.TEXT_SECONDARY} hover:${COLORS.TEXT_ACCENT}`
    };

    const Component = as || (
        variant.startsWith('h') ? variant as React.ElementType : 'p'
    );

    const variantStyle = variants[variant];
    const colorStyle = accent ? COLORS.TEXT_ACCENT : (className.includes('text-') ? '' : defaultColors[variant]);

    return (
        <Component
            className={`${baseStyles} ${variantStyle} ${colorStyle} ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
};

export const Heading: React.FC<TypographyProps & { level?: 1 | 2 | 3 | 4 }> = ({ level = 2, ...props }) => (
    <Typography variant={`h${level}` as TypographyVariant} {...props} />
);

export const Text: React.FC<TypographyProps> = (props) => (
    <Typography variant="body" {...props} />
);

export const Caption: React.FC<TypographyProps> = (props) => (
    <Typography variant="caption" {...props} />
);
