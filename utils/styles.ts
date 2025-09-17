/**
 * @file CSS class utilities untuk konsistensi styling
 */

/**
 * Common spacing classes
 */
export const SPACING = {
  SECTION_PADDING: 'py-24 container mx-auto px-6 md:px-16 lg:px-20',
  SECTION_PADDING_PRINT: 'print:py-12',
  CONTAINER_PADDING: 'px-6 md:px-16 lg:px-20',
  COMPACT_SPACING: 'space-y-4',
  COMPACT_SPACING_PRINT: 'print:space-y-2',
  GRID_GAP: 'gap-6',
  GRID_GAP_PRINT: 'print:gap-4',
} as const;

/**
 * Typography classes
 */
export const TYPOGRAPHY = {
  HEADING_LARGE: 'text-4xl sm:text-6xl lg:text-7xl font-poppins font-bold',
  HEADING_MEDIUM: 'text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold',
  HEADING_SECTION: 'text-2xl md:text-3xl font-poppins font-bold',
  BODY_TEXT: 'text-soft-gray leading-relaxed',
  SMALL_TEXT: 'text-sm text-soft-gray',
  WEIGHT_BOLD: 'font-bold',
  WEIGHT_SEMIBOLD: 'font-semibold',
  WEIGHT_NORMAL: 'font-normal',
} as const;

/**
 * Color classes
 */
export const COLORS = {
  TEXT_PRIMARY: 'text-deep-navy',
  TEXT_SECONDARY: 'text-soft-gray',
  TEXT_ACCENT: 'text-accent-blue',
  TEXT_WHITE: 'text-white',
  TEXT_MUTED: 'text-light-slate',
  BG_PRIMARY: 'bg-deep-navy',
  BG_SECONDARY: 'bg-light-navy',
  BG_ACCENT: 'bg-accent-blue',
  BORDER_ACCENT: 'border-accent-blue',
  HOVER_ACCENT: 'hover:bg-accent-blue',
  HOVER_TEXT_PRIMARY: 'hover:text-deep-navy',
} as const;

/**
 * Layout classes
 */
export const LAYOUT = {
  GRID_RESPONSIVE: 'grid grid-cols-1 md:grid-cols-2',
  GRID_PORTFOLIO: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  FLEX_CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex justify-between items-center',
  FLEX_COL: 'flex flex-col',
  FIXED_BOTTOM_RIGHT: 'fixed bottom-6 right-6 z-50',
  FIXED_BOTTOM_LEFT: 'fixed bottom-6 left-6 z-40',
  FIXED_BOTTOM_RIGHT_ALT: 'fixed bottom-24 right-6',
} as const;

/**
 * Print-specific classes
 */
export const PRINT = {
  HIDE: 'print:hidden',
  SHOW: 'hidden print:block',
  PRESERVE_COLORS: 'print-preserve-colors',
  AVOID_BREAK: 'print-avoid-break',
  PAGE_BREAK: 'print-break-before',
  NO_BREAK: 'print-no-break',
  COMPACT_TEXT: 'print:text-sm',
  COMPACT_SPACING: 'print:space-y-2',
} as const;