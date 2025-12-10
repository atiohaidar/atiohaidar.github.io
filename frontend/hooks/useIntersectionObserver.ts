import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook yang menggunakan timer untuk menampilkan animasi secara bertahap
 * saat halaman dimuat, tanpa menunggu scroll.
 * 
 * @param {IntersectionObserverInit} options Opsi untuk Intersection Observer (masih dipertahankan untuk kompatibilitas).
 * @param {number} delay Delay dalam milliseconds sebelum animasi dimulai.
 * @returns {[React.RefObject<HTMLDivElement>, boolean]} Sebuah tuple yang berisi:
 * - `ref`: Ref yang harus dilampirkan ke elemen target.
 * - `isIntersecting`: Boolean yang bernilai `true` setelah delay selesai.
 */
export const useIntersectionObserver = (options: IntersectionObserverInit = { threshold: 0.1 }, delay: number = 0) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hasIntersected = useRef(false); // To ensure we only animate once

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasIntersected.current) {
                hasIntersected.current = true;
                if (delay > 0) {
                    setTimeout(() => setIsIntersecting(true), delay);
                } else {
                    setIsIntersecting(true);
                }
                if (ref.current) observer.unobserve(ref.current);
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [delay, options.threshold]);

    return [ref, isIntersecting] as const;
};
