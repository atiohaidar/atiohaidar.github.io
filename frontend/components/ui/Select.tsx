/**
 * @file Reusable Select component
 * Standardizes dropdown styling
 */
import React from 'react';
import { DASHBOARD_THEME } from '../../utils/styles';
import { useTheme } from '../../contexts/ThemeContext';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: 'default' | 'glass';
    options?: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    helperText,
    className = '',
    variant = 'glass',
    options = [],
    children,
    ...props
}) => {
    const { theme } = useTheme();

    // Notebook style select
    const selectBaseStyle = 'bg-transparent border-b-2 border-slate-800 dark:border-slate-600 text-slate-900 dark:text-white focus:border-ink-blue dark:focus:border-chalk-blue rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-patrick cursor-pointer appearance-none';

    const errorStyle = error
        ? 'border-red-500 focus:border-red-500'
        : '';

    return (
        <div className="w-full">
            {label && (
                <label className={`block text-lg font-bold font-patrick text-slate-900 dark:text-white mb-2 ml-1`}>
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`w-full px-4 py-3 shadow-none focus:outline-none focus:ring-0 ${selectBaseStyle} ${errorStyle} ${className}`}
                    {...props}
                >
                    {children ? children : options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="dark:bg-slate-800">
                            {opt.label}
                        </option>
                    ))}
                </select>
                {/* Custom arrow if needed, but for now relying on browser default or keeping clean */}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 font-caveat">{error}</p>
            )}
            {helperText && !error && (
                <p className={`mt-1 text-sm text-slate-500 font-caveat`}>{helperText}</p>
            )}
        </div>
    );
};
