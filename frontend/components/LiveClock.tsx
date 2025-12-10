import React, { useState, useEffect } from 'react';

interface LiveClockProps {
    /** Show seconds */
    showSeconds?: boolean;
    /** Show date */
    showDate?: boolean;
    /** Show day name */
    showDay?: boolean;
    /** 24-hour format */
    use24Hour?: boolean;
    /** Timezone (default: local) */
    timezone?: string;
    /** Custom className */
    className?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Separator between time segments */
    separator?: string;
    /** Animate the seconds */
    animateSeconds?: boolean;
}

const LiveClock: React.FC<LiveClockProps> = ({
    showSeconds = true,
    showDate = true,
    showDay = true,
    use24Hour = true,
    timezone,
    className = '',
    size = 'md',
    separator = ':',
    animateSeconds = true
}) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...(showSeconds && { second: '2-digit' }),
        hour12: !use24Hour,
        ...(timezone && { timeZone: timezone })
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(timezone && { timeZone: timezone })
    };

    const dayOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        ...(timezone && { timeZone: timezone })
    };

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    const displayHours = use24Hour ? hours : hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';

    const sizeClasses = {
        sm: {
            time: 'text-xl md:text-2xl',
            date: 'text-xs',
            day: 'text-xs',
            ampm: 'text-sm'
        },
        md: {
            time: 'text-3xl md:text-4xl',
            date: 'text-sm',
            day: 'text-sm',
            ampm: 'text-lg'
        },
        lg: {
            time: 'text-5xl md:text-6xl',
            date: 'text-base',
            day: 'text-base',
            ampm: 'text-xl'
        }
    };

    const sizes = sizeClasses[size];

    return (
        <div className={`text-center ${className}`}>
            {/* Time Display */}
            <div className={`font-mono font-bold ${sizes.time} tracking-wider`}>
                <span className="inline-block tabular-nums">
                    {formatNumber(displayHours)}
                </span>
                <span className="animate-pulse mx-1">{separator}</span>
                <span className="inline-block tabular-nums">
                    {formatNumber(minutes)}
                </span>
                {showSeconds && (
                    <>
                        <span className="animate-pulse mx-1">{separator}</span>
                        <span className={`inline-block tabular-nums ${animateSeconds ? 'transition-all duration-300' : ''}`}>
                            {formatNumber(seconds)}
                        </span>
                    </>
                )}
                {!use24Hour && (
                    <span className={`ml-2 ${sizes.ampm} opacity-70`}>{ampm}</span>
                )}
            </div>

            {/* Day Display */}
            {showDay && (
                <div className={`${sizes.day} opacity-60 mt-1 font-medium`}>
                    {time.toLocaleDateString('id-ID', dayOptions)}
                </div>
            )}

            {/* Date Display */}
            {showDate && (
                <div className={`${sizes.date} opacity-50 mt-0.5`}>
                    {time.toLocaleDateString('id-ID', dateOptions)}
                </div>
            )}
        </div>
    );
};

export default LiveClock;
