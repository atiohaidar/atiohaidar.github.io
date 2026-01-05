/**
 * @file Highlighter component for stabilo/marker effect
 * Creates a hand-drawn highlight effect behind text
 */
import React from 'react';

export interface HighlighterProps {
    children: React.ReactNode;
    color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange';
    className?: string;
}

const colorMap = {
    yellow: 'bg-marker-yellow',
    pink: 'bg-marker-pink',
    blue: 'bg-marker-blue',
    green: 'bg-marker-green',
    orange: 'bg-marker-orange',
};

export const Highlighter: React.FC<HighlighterProps> = ({
    children,
    color = 'yellow',
    className = '',
}) => {
    return (
        <span
            className={`relative inline-block ${className}`}
        >
            <span
                className={`absolute inset-0 ${colorMap[color]} opacity-40 -skew-x-2 -rotate-1 rounded-sm`}
                style={{
                    top: '15%',
                    bottom: '5%',
                    left: '-2px',
                    right: '-2px',
                    zIndex: -1
                }}
            />
            <span className="relative z-10">{children}</span>
        </span>
    );
};

export default Highlighter;
