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
export const useIntersectionObserver = (options: IntersectionObserverInit, delay: number = 0) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Set timer untuk menampilkan animasi setelah delay
        const timer = setTimeout(() => {
            setIsIntersecting(true);
        }, delay);

        return () => {
            // Cleanup timer
            clearTimeout(timer);
        };
    }, [delay]);

    return [ref, isIntersecting] as const;
};
