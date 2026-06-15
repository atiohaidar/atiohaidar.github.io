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
import { COLORS, LAYOUT, PRINT, SPACING } from '../utils/styles';
import { createAnimationStyle } from '../utils/animations';
import { Typography, Heading, HandwritingText } from './ui';

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
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.01 }, delay);
  const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

  const titleAlignment = centerTitle ? 'justify-center' : '';
  const pageBreakClass = printPageBreak ? PRINT.PAGE_BREAK : PRINT.NO_BREAK;

  return (
    <section
      id={id}
      ref={ref}
      className={`${SPACING.SECTION_PADDING} ${pageBreakClass} ${SPACING.SECTION_PADDING_PRINT} ${animationClass} ${className}`}
    >
      <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-8 flex items-center ${titleAlignment} print:mb-4 print:text-xl`}>
        <span className={`hand-drawn-circle ${COLORS.TEXT_ACCENT} mr-4 print:mr-2 text-sm`}>{number}.</span>
        <HandwritingText
          text={title}
          fontSize={36}
          duration={1.5}
          delay={0.2}
          className="inline-block"
        />
        {!centerTitle && <span className="h-1 w-20 sm:w-40 bg-slate-800 dark:bg-slate-400/30 ml-4 print:bg-gray-400 print:ml-2 print:w-16 rounded-full opacity-50"></span>}
      </Heading>
      {children}
    </section>
  );
};

export default Section;
