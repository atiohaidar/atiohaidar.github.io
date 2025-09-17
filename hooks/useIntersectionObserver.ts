import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook yang menggunakan Intersection Observer API untuk mendeteksi
 * kapan sebuah elemen masuk ke dalam viewport.
 * Berguna untuk memicu animasi saat elemen di-scroll ke dalam pandangan.
 *
 * @param {IntersectionObserverInit} options Opsi untuk Intersection Observer, seperti `threshold`.
 * @returns {[React.RefObject<HTMLDivElement>, boolean]} Sebuah tuple yang berisi:
 * - `ref`: Ref yang harus dilampirkan ke elemen target.
 * - `isIntersecting`: Boolean yang bernilai `true` jika elemen sedang terlihat.
 */
export const useIntersectionObserver = (options: IntersectionObserverInit) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            // Saat elemen pertama kali terlihat, set state menjadi true dan berhenti mengamati.
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            // Cleanup: berhenti mengamati elemen saat komponen unmount.
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);

    return [ref, isIntersecting] as const;
};
