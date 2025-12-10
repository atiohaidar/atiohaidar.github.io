import React, { useRef, useEffect, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    threshold?: number;
    className?: string; // Allow custom classes
    random?: boolean; // New prop for random fly-in
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    direction = 'up',
    delay = 0,
    threshold = 0.15,
    className = '',
    random = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Store random transforms in ref to persist them
    const randomTransform = useRef({
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0.9 // Start slightly smaller
    });

    useEffect(() => {
        // Disable random effects on mobile to prevent visibility issues
        const isMobile = window.innerWidth < 768; // Standard mobile breakpoint

        if (random && randomTransform.current.x === 0) {
            if (isMobile) {
                // No random transform on mobile for safety
                randomTransform.current = { x: 0, y: 0, rotate: 0, scale: 0.95 };
            } else {
                // Generate random values only once on mount (Desktop only)
                const randomSign = () => Math.random() > 0.5 ? 1 : -1;
                randomTransform.current = {
                    x: Math.random() * 50 * randomSign(), // -50px to 50px
                    y: 50 + Math.random() * 50, // 50px to 100px (always coming from below roughly)
                    rotate: Math.random() * 5 * randomSign(), // -5deg to 5deg
                    scale: 0.9
                };
            }
        }
    }, [random]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Determine scrolling direction/visibility state
                setIsVisible(entry.isIntersecting);
            },
            {
                // Lower threshold for mobile to ensure trigger even if element is tall
                threshold: window.innerWidth < 768 ? 0.05 : threshold,
                rootMargin: "0px 0px -50px 0px" // Trigger slightly before element is fully out/in
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    const getBaseStyle = () => {
        if (!isVisible) {
            if (random) {
                const { x, y, rotate, scale } = randomTransform.current;
                return {
                    opacity: 0,
                    transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
                    transition: 'all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1)' // Ease out "wind" feel
                };
            }
            // Standard exit
            return {
                opacity: 0,
                transform: 'translateY(30px)', // Simple fade down
                transition: 'all 0.6s ease-out'
            };
        }

        // Visible State (Reset transforms)
        return {
            opacity: 1,
            transform: 'translate(0, 0) rotate(0deg) scale(1)',
            transition: `all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}ms`
        };
    };

    return (
        <div
            ref={ref}
            className={`${className}`}
            style={getBaseStyle()}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
