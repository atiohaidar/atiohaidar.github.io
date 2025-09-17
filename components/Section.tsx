/**
 * @file Komponen wrapper generik untuk setiap bagian utama halaman.
 * Komponen ini menangani:
 * - Rendering judul bernomor yang konsisten.
 * - Menerapkan animasi fade-in-on-scroll.
 * - Menyediakan padding dan container standar.
 * - Mengatur page-break untuk pencetakan.
 */
import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface SectionProps {
  /** ID unik untuk section, digunakan untuk navigasi. */
  id: string;
  /** Nomor urut section, ditampilkan sebelum judul. */
  number: string;
  /** Judul utama section. */
  title: string;
  /** Konten dari section. */
  children: React.ReactNode;
  /** Opsi untuk menengahkan judul, defaultnya rata kiri. */
  centerTitle?: boolean;
  /** Kelas CSS tambahan untuk elemen section. */
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, number, title, children, centerTitle = false, className = '' }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

  const titleAlignment = centerTitle ? 'justify-center' : '';

  return (
    <section 
      id={id} 
      ref={ref} 
      className={`py-24 container mx-auto px-6 md:px-10 print-break-before print:py-12 ${animationClass} ${className}`}
    >
      <h2 className={`text-2xl md:text-3xl font-poppins font-bold text-white mb-8 flex items-center print:text-black print:text-2xl ${titleAlignment}`}>
        <span className="text-accent-blue mr-3 print:text-gray-600">{number}.</span>
        {title}
        {!centerTitle && <span className="h-px w-20 sm:w-40 bg-soft-gray/30 ml-4 print:bg-gray-400"></span>}
      </h2>
      {children}
    </section>
  );
};

export default Section;
