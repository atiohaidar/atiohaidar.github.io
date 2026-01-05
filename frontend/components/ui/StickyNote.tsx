import React from 'react';
import { COLORS } from '../../utils/styles';
import { Text } from './Typography';

interface StickyNoteProps {
    children: React.ReactNode;
    color?: 'yellow' | 'pink' | 'blue' | 'green';
    className?: string;
    rotate?: number;
}

const colorMap = {
    yellow: 'bg-marker-yellow/90 dark:bg-yellow-900/40',
    pink: 'bg-marker-pink/90 dark:bg-pink-900/40',
    blue: 'bg-marker-blue/90 dark:bg-blue-900/40',
    green: 'bg-marker-green/90 dark:bg-green-900/40',
};

export const StickyNote: React.FC<StickyNoteProps> = ({
    children,
    color = 'yellow',
    className = '',
    rotate = -2
}) => {
    return (
        <div
            className={`p-6 shadow-xl relative group transition-transform hover:scale-105 ${colorMap[color]} ${className}`}
            style={{
                transform: `rotate(${rotate}deg)`,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%)',
                minWidth: '180px'
            }}
        >
            {/* Shadow fold effect */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-black/10 dark:bg-white/10" />

            <div className="font-patrick text-ink-blue dark:text-chalk-blue text-lg">
                {children}
            </div>
        </div>
    );
};
