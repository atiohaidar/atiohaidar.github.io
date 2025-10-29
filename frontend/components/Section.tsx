/**
 * @file Komponen wrapper generik untuk setiap bagian utama halaman dengan refactored utilities.
 * Komponen ini menangani:
 * - Rendering judul bernomor yang konsisten.
 * - Menerapkan animasi fade-in-on-scroll.
 * - Menyediakan padding dan container standar.
 * - Mengatur page-break untuk pencetakan.
 */
import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { COLORS, LAYOUT, PRINT, SPACING, TYPOGRAPHY } from '../utils/styles';
import { createAnimationStyle } from '../utils/animations';

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
  /** Delay animasi dalam milliseconds. */
  delay?: number;
  /** Apakah section ini memerlukan page break di print. */
  printPageBreak?: boolean;
}

const Section: React.FC<SectionProps> = ({ id, number, title, children, centerTitle = false, className = '', delay = 0, printPageBreak = false }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 }, delay);
  const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

  const titleAlignment = centerTitle ? 'justify-center' : '';
  const pageBreakClass = printPageBreak ? PRINT.PAGE_BREAK : PRINT.NO_BREAK;

  return (
    <section 
      id={id} 
      ref={ref} 
      className={`${SPACING.SECTION_PADDING} ${pageBreakClass} ${SPACING.SECTION_PADDING_PRINT} ${animationClass} ${className}`}
    >
      <h2 className={`${TYPOGRAPHY.HEADING_SECTION} text-light-text dark:text-white mb-8 ${LAYOUT.FLEX_CENTER} ${titleAlignment}`}>
        <span className={`text-light-accent dark:text-accent-blue mr-3`}>{number}.</span>
        {title}
        {!centerTitle && <span className="h-px w-20 sm:w-40 bg-gray-300 dark:bg-soft-gray/30 ml-4 print:bg-gray-400"></span>}
      </h2>
      {children}
    </section>
  );
};

export default Section;
