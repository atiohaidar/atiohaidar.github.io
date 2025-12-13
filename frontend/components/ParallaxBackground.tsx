import React, { useEffect, useState } from 'react';
import { useMultiParallax } from '../hooks/useParallax';

interface ParallaxBackgroundProps {
    /** Sensitivity multiplier for movement (default: 1). */
    intensity?: number;
    /** Custom z-index for the background layer */
    zIndex?: number;
    /** Opacity of the background elements (0 to 1, default: 0.9) */
    opacity?: number;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
    intensity = 1,
    zIndex = -10,
    opacity = 0.2
}) => {
    const parallax = useMultiParallax();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Trigger entrance animation after a brief delay to ensure initial render is registered
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 2000);

        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse position from center screen (-1 to 1)
            // This allows movement in all directions relative to center
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timer);
        };
    }, []);

    /**
     * Calculates the transform style for a specific layer depth.
     * @param depth Factor relative to base intensity (e.g., 0.5, 1.0, 1.5)
     */
    const getLayerStyle = (depth: number) => {
        // Scroll offset acts vertically
        const scrollOffset = parallax.getOffset(0.05 * depth * intensity, 'down');

        // Mouse offset acts on both axes
        // Base range is 100px * intensity * depth
        const mouseRange = 100 * intensity;
        const xOffset = mousePos.x * mouseRange * depth;
        const yOffset = mousePos.y * mouseRange * depth;

        return {
            transform: `translate3d(${xOffset}px, ${scrollOffset + yOffset}px, 0)`,
            zIndex,
            opacity: isMounted ? opacity : 0,
            transition: `transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 2s ease-in-out`
        };
    };

    return (
        <>
            {/* Gradient Overlay - Static but with entrance fade */}
            <div
                className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 pointer-events-none"
                style={{
                    zIndex,
                    opacity: isMounted ? opacity : 0,
                    transition: 'opacity 2s ease-in-out'
                }}
            />

            {/* Animated Orbs with Mouse & Scroll Parallax */}
            <div
                className="fixed top-[20%] right-[10%] w-[600px] h-[600px] bg-accent-blue/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen pointer-events-none"
                style={getLayerStyle(1.0)}
            />
            <div
                className="fixed bottom-[20%] left-[10%] w-[600px] h-[600px] bg-purple-500/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen pointer-events-none"
                style={getLayerStyle(1.5)}
            />
            <div
                className="fixed top-[40%] left-[40%] w-[600px] h-[600px] bg-cyan-500/40 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen pointer-events-none"
                style={getLayerStyle(2.0)}
            />
        </>
    );
};

export default ParallaxBackground;
