/**
 * @file Custom hook untuk parallax scrolling effect.
 * Mengembalikan nilai offset berdasarkan scroll position.
 */
import { useState, useEffect, useCallback } from 'react';

interface ParallaxOptions {
    /** Speed multiplier (0.1 = slow, 1 = same as scroll) */
    speed?: number;
    /** Direction of movement */
    direction?: 'up' | 'down';
}

/**
 * Hook untuk membuat parallax effect sederhana.
 * @param options - Konfigurasi parallax
 * @returns Offset value dalam pixels
 */
export const useParallax = (options: ParallaxOptions = {}) => {
    const { speed = 0.3, direction = 'up' } = options;
    const [offset, setOffset] = useState(0);

    const handleScroll = useCallback(() => {
        const scrollY = window.scrollY;
        const multiplier = direction === 'up' ? -1 : 1;
        setOffset(scrollY * speed * multiplier);
    }, [speed, direction]);

    useEffect(() => {
        // Use passive listener for better scroll performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return offset;
};

/**
 * Hook untuk multiple parallax layers dengan kecepatan berbeda.
 */
export const useMultiParallax = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return {
        scrollY,
        // Helper functions untuk berbagai kecepatan
        slow: scrollY * 0.1,
        medium: scrollY * 0.3,
        fast: scrollY * 0.5,
        // Function untuk custom speed
        getOffset: (speed: number, direction: 'up' | 'down' = 'up') => {
            const multiplier = direction === 'up' ? -1 : 1;
            return scrollY * speed * multiplier;
        }
    };
};

export default useParallax;
