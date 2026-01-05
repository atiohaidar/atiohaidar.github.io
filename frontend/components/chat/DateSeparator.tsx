import React, { memo } from 'react';

interface DateSeparatorProps {
    dateLabel: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = memo(({ dateLabel }) => {
    return (
        <div className="flex items-center justify-center my-6">
            <div className="bg-chat-dark-bubble text-gray-300 text-xs px-4 py-2 rounded-full border border-chat-dark-border shadow-sm">
                {dateLabel}
            </div>
        </div>
    );
});

DateSeparator.displayName = 'DateSeparator';

export default DateSeparator;
