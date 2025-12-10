/**
 * @file Reusable Parallax Background component dengan animated orbs.
 * Dapat digunakan di semua halaman untuk konsistensi visual.
 */
import React from 'react';
import { useMultiParallax } from '../hooks/useParallax';

interface ParallaxBackgroundProps {
    /** Intensity multiplier (default: 1). Use lower for subtle effect. */
    intensity?: number;
    /** Custom z-index for the background layer */
    zIndex?: number;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
    intensity = 1,
    zIndex = -10
}) => {
    const parallax = useMultiParallax();

    return (
        <>
            {/* Gradient Overlay */}
            <div
                className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 pointer-events-none"
                style={{ zIndex }}
            />

            {/* Animated Orbs with Parallax */}
            <div
                className="fixed top-[20%] right-[10%] w-[600px] h-[600px] bg-accent-blue/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-90 pointer-events-none"
                style={{
                    transform: `translateY(${parallax.getOffset(0.05 * intensity, 'down')}px)`,
                    zIndex
                }}
            />
            <div
                className="fixed bottom-[20%] left-[10%] w-[600px] h-[600px] bg-purple-500/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-90 pointer-events-none"
                style={{
                    transform: `translateY(${parallax.getOffset(0.08 * intensity, 'down')}px)`,
                    zIndex
                }}
            />
            <div
                className="fixed top-[40%] left-[40%] w-[600px] h-[600px] bg-cyan-500/40 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-90 pointer-events-none"
                style={{
                    transform: `translateY(${parallax.getOffset(0.12 * intensity, 'down')}px)`,
                    zIndex
                }}
            />
        </>
    );
};

export default ParallaxBackground;
