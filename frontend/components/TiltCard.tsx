import React, { useRef, useState } from 'react';

interface TiltCardProps {
    children: React.ReactNode;
    /** Maximum tilt angle in degrees */
    maxTilt?: number;
    /** Scale on hover */
    scale?: number;
    /** Perspective value for 3D effect */
    perspective?: number;
    /** Transition speed in ms */
    speed?: number;
    /** Enable/disable the glare effect */
    glare?: boolean;
    /** Maximum glare opacity */
    glareMaxOpacity?: number;
    /** Custom className */
    className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({
    children,
    maxTilt = 15,
    scale = 1.02,
    perspective = 1000,
    speed = 400,
    glare = true,
    glareMaxOpacity = 0.3,
    className = ''
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');
    const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation (inverted for natural feel)
        const rotateX = (mouseY / (rect.height / 2)) * -maxTilt;
        const rotateY = (mouseX / (rect.width / 2)) * maxTilt;

        setTransform(`perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`);

        // Update glare position
        if (glare) {
            const glareX = ((mouseX + rect.width / 2) / rect.width) * 100;
            const glareY = ((mouseY + rect.height / 2) / rect.height) * 100;
            setGlareStyle({
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareMaxOpacity}), transparent 60%)`,
                opacity: 1
            });
        }
    };

    const handleMouseLeave = () => {
        setTransform('');
        setGlareStyle({ opacity: 0 });
    };

    return (
        <div
            ref={cardRef}
            className={`relative transform-gpu will-change-transform ${className}`}
            style={{
                transform,
                transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {glare && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit z-10"
                    style={{
                        ...glareStyle,
                        transition: `opacity ${speed}ms ease-out`,
                        borderRadius: 'inherit'
                    }}
                />
            )}
        </div>
    );
};

export default TiltCard;
