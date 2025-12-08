import React, { memo } from 'react';

interface DateSeparatorProps {
    dateLabel: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = memo(({ dateLabel }) => {
    return (
        <div className="flex items-center justify-center my-6">
            <div className="bg-[#1f2c34] text-gray-300 text-xs px-4 py-2 rounded-full border border-[#2a3942] shadow-sm">
                {dateLabel}
            </div>
        </div>
    );
});

DateSeparator.displayName = 'DateSeparator';

export default DateSeparator;
