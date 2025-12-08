/**
 * Lazy Image Component
 * Uses Intersection Observer for efficient lazy loading of images
 * Only loads images when they enter the viewport, reducing initial page load
 */
import React, { useState, useRef, useEffect, memo } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholderClassName?: string;
    width?: number | string;
    height?: number | string;
    onLoad?: () => void;
    onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = memo(({
    src,
    alt,
    className = '',
    placeholderClassName = '',
    width,
    height,
    onLoad,
    onError
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '100px', // Start loading 100px before entering viewport
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Placeholder/Loading state */}
            {!isLoaded && !hasError && (
                <div
                    className={`absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center ${placeholderClassName}`}
                >
                    <svg
                        className="w-8 h-8 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm0 2v10h16V7H4zm8 2a2 2 0 110 4 2 2 0 010-4z" />
                    </svg>
                </div>
            )}

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-500">
                    <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z" />
                    </svg>
                </div>
            )}

            {/* Actual image (only rendered when in view) */}
            {isInView && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    decoding="async"
                />
            )}
        </div>
    );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
