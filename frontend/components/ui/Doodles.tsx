import React from 'react';

interface DoodleProps {
    className?: string;
    color?: string;
    style?: React.CSSProperties;
}

export const DoodleArrow: React.FC<DoodleProps & { direction?: 'left' | 'right' | 'up' | 'down' }> = ({
    className = "",
    color = "currentColor",
    direction = 'right',
    style
}) => {
    // Basic rotation based on direction
    const rotation = {
        'right': 'rotate(0deg)',
        'down': 'rotate(90deg)',
        'left': 'rotate(180deg)',
        'up': 'rotate(270deg)'
    }[direction];

    return (
        <svg
            viewBox="0 0 100 60"
            className={`fill-none stroke-current stroke-2 ${className}`}
            style={{ transform: rotation, ...style }}
            color={color}
        >
            {/* Hand-drawn arrow shaft and head */}
            <path
                d="M5,30 Q40,25 90,30 M90,30 L75,20 M90,30 L78,42"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw"
            />
        </svg>
    );
};

export const DoodleCircle: React.FC<DoodleProps> = ({ className = "", color = "currentColor", style }) => (
    <svg
        viewBox="0 0 100 100"
        className={`fill-none stroke-current stroke-2 ${className}`}
        style={style}
        color={color}
    >
        {/* Irregular hand-drawn loop */}
        <path
            d="M50,10 C75,10 90,25 90,50 C90,78 70,90 50,90 C25,90 10,75 10,50 C10,20 30,10 48,12"
            strokeLinecap="round"
            strokeDasharray="300"
            strokeDashoffset="0"
        />
    </svg>
);

export const DoodleStar: React.FC<DoodleProps> = ({ className = "", color = "currentColor", style }) => (
    <svg
        viewBox="0 0 40 40"
        className={`fill-none stroke-current stroke-2 ${className}`}
        style={style}
        color={color}
    >
        {/* Simple 5-point star loose sketch */}
        <path
            d="M20,2 L24,14 L38,14 L26,22 L30,36 L20,28 L10,36 L14,22 L2,14 L16,14 Z"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const DoodleSparkle: React.FC<DoodleProps> = ({ className = "", color = "currentColor", style }) => (
    <svg
        viewBox="0 0 40 40"
        className={`fill-none stroke-current stroke-2 ${className}`}
        style={style}
        color={color}
    >
        {/* Four-point sparkle */}
        <path
            d="M20,0 L20,40 M0,20 L40,20"
            strokeLinecap="round"
            className="opacity-70"
        />
    </svg>
);

export const DoodleCurly: React.FC<DoodleProps> = ({ className = "", color = "currentColor", style }) => (
    <svg
        viewBox="0 0 100 30"
        className={`fill-none stroke-current stroke-2 ${className}`}
        style={style}
        color={color}
    >
        {/* Curly connector line */}
        <path
            d="M0,15 Q10,0 20,15 T40,15 T60,15 T80,15 T100,15"
            strokeLinecap="round"
        />
    </svg>
);

export const DoodleUnderline: React.FC<DoodleProps> = ({ className = "", color = "currentColor", style }) => (
    <svg
        viewBox="0 0 200 20"
        className={`fill-none stroke-current stroke-2 ${className}`}
        style={style}
        color={color}
        preserveAspectRatio="none"
    >
        {/* Rough underline */}
        <path
            d="M0,10 Q50,15 100,10 T200,10"
            strokeLinecap="round"
        />
    </svg>
);

export const DoodlePaperclip: React.FC<DoodleProps> = ({ className = "", color = "currentColor", style }) => (
    <svg
        viewBox="0 0 40 100"
        className={`fill-none stroke-current stroke-2 ${className}`}
        style={style}
        color={color}
    >
        {/* Paperclip shape */}
        <path
            d="M30,80 L30,20 C30,10 10,10 10,20 L10,70 C10,85 35,85 35,70 L35,30"
            strokeLinecap="round"
        />
    </svg>
);

export const DoodleWashiTape: React.FC<DoodleProps & { orientation?: 'horizontal' | 'vertical' }> = ({
    className = "",
    color = "currentColor",
    orientation = 'horizontal',
    style
}) => {
    const isHorizontal = orientation === 'horizontal';
    return (
        <div
            className={`opacity-60 mix-blend-multiply dark:mix-blend-normal ${className}`}
            style={{
                width: isHorizontal ? '120px' : '30px',
                height: isHorizontal ? '30px' : '120px',
                backgroundColor: color,
                clipPath: isHorizontal
                    ? 'polygon(0% 10%, 10% 0%, 90% 5%, 100% 0%, 95% 40%, 100% 100%, 85% 90%, 10% 100%, 0% 85%)'
                    : 'polygon(10% 0%, 0% 10%, 5% 90%, 0% 100%, 40% 95%, 100% 100%, 90% 85%, 100% 10%, 85% 0%)',
                maskImage: 'radial-gradient(circle, white 2px, transparent 2.5px)',
                maskSize: '10px 10px',
                ...style
            }}
        />
    );
};

export const DoodleCoffeeRing: React.FC<DoodleProps> = ({ className = "", color = "#78350f" }) => (
    <svg
        viewBox="0 0 100 100"
        className={`fill-none stroke-current opacity-20 pointer-events-none ${className}`}
        color={color}
    >
        {/* Irregular double ring */}
        <path
            d="M50,10 C75,8 92,25 90,50 C88,75 70,92 50,90 C25,88 8,70 10,50 C12,25 30,12 50,15"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M50,20 C68,18 82,32 80,50 C78,68 64,82 50,80 C32,78 18,64 20,50 C22,32 35,22 50,25"
            strokeWidth="0.5"
            strokeLinecap="round"
            opacity="0.5"
        />
    </svg>
);

export const DoodleSignature: React.FC<DoodleProps> = ({ className = "", color = "currentColor", style }) => (
    <svg
        viewBox="0 0 200 60"
        className={`fill-none stroke-current stroke-1.5 opacity-80 ${className}`}
        style={style}
        color={color}
    >
        {/* Hand-drawn style signature "Atio" */}
        <path
            d="M20,40 Q30,10 40,40 T60,40 M60,40 L60,20 M70,40 Q80,20 90,40 M100,20 L100,45 M110,40 Q130,35 150,40"
            strokeLinecap="round"
            className="animate-draw"
        />
    </svg>
);

export const DoodleMascot: React.FC<DoodleProps> = ({ className = "", color = "currentColor", style }) => (
    <svg
        viewBox="0 0 100 100"
        className={`fill-none stroke-current stroke-2 ${className}`}
        style={style}
        color={color}
    >
        {/* Cute hand-drawn computer/monitor mascot */}
        <rect x="20" y="20" width="60" height="45" rx="5" strokeLinecap="round" />
        <path d="M30,30 L70,30 M30,40 L50,40" strokeLinecap="round" opacity="0.5" />
        <path d="M40,65 L35,80 L65,80 L60,65" strokeLinecap="round" />
        {/* <circle cx="40" cy="45" r="3" fill="currentColor" /> */}
        {/* <circle cx="60" cy="45" r="3" fill="currentColor" /> */}
        <path d="M45,55 Q50,60 55,55" strokeLinecap="round" />
    </svg>
);

