import React, { memo } from 'react';
import { Typography } from '../ui';
import { COLORS } from '../../utils/styles';

interface DateSeparatorProps {
    dateLabel: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = memo(({ dateLabel }) => {
    return (
        <div className="flex items-center justify-center my-8 relative">
            <div className={`absolute inset-0 flex items-center px-4`} aria-hidden="true">
                <div className={`w-full border-t-2 border-dashed ${COLORS.BORDER} opacity-30`}></div>
            </div>
            <div className={`relative px-4 py-1 rounded-full border-2 border-dashed ${COLORS.BORDER} bg-white dark:bg-gray-800 shadow-sm transform -rotate-1`}>
                <Typography variant="caption" className={`font-bold font-patrick ${COLORS.TEXT_SECONDARY}`}>
                    {dateLabel}
                </Typography>
            </div>
        </div>
    );
});

DateSeparator.displayName = 'DateSeparator';

export default DateSeparator;

