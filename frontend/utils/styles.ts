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
  HEADING_LARGE: 'text-4xl sm:text-6xl lg:text-7xl font-patrick font-bold',
  HEADING_MEDIUM: 'text-3xl sm:text-5xl lg:text-6xl font-patrick font-bold',
  HEADING_SECTION: 'text-2xl md:text-3xl font-patrick font-bold',
  HEADING_CARD: 'text-xl font-patrick font-bold',
  BODY_TEXT: 'text-slate-700 dark:text-slate-300 leading-relaxed font-patrick text-lg',
  SMALL_TEXT: 'text-sm text-slate-600 dark:text-slate-400 font-patrick',
  WEIGHT_BOLD: 'font-bold',
  WEIGHT_SEMIBOLD: 'font-semibold',
  WEIGHT_NORMAL: 'font-normal',
} as const;

/**
 * Color classes - Theme aware (using Tailwind dark: modifier)
 */
export const COLORS = {
  // Backgrounds
  BG_PRIMARY: 'bg-paper-cream dark:bg-paper-dark notebook-lines',
  BG_SECONDARY: 'bg-white dark:bg-slate-800 border-2 border-slate-800 dark:border-slate-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]',
  PANEL: 'bg-paper-cream dark:bg-paper-dark border-2 border-slate-800 dark:border-slate-600',

  // Text colors
  TEXT_PRIMARY: 'text-slate-900 dark:text-chalk-white',
  TEXT_SECONDARY: 'text-slate-700 dark:text-slate-300',
  TEXT_MUTED: 'text-slate-500 dark:text-slate-400',
  TEXT_ACCENT: 'text-ink-blue dark:text-chalk-blue',
  TEXT_ON_ACCENT: 'text-white dark:text-slate-900',
  TEXT_WHITE: 'text-slate-900 dark:text-white',

  // Borders
  BORDER: 'border-slate-800 dark:border-slate-600',
  BORDER_ACCENT: 'border-ink-blue dark:border-chalk-blue',

  // Backgrounds with accent
  BG_ACCENT: 'bg-marker-blue dark:bg-slate-700',
  BUTTON_PRIMARY: 'bg-marker-yellow dark:bg-marker-yellow text-slate-900',

  // Hover states
  HOVER_ACCENT: 'hover:bg-marker-blue/50 dark:hover:bg-slate-600',
  HOVER_TEXT_PRIMARY: 'hover:text-ink-blue dark:hover:text-chalk-blue',
  HOVER_TEXT_ACCENT: 'hover:text-blue-800 dark:hover:text-white',
} as const;

export type DashboardThemeMode = 'light' | 'dark';

export interface DashboardThemeConfig {
  appBg: string;
  contentBg: string;
  sidebar: {
    bg: string;
    border: string;
    text: string;
    textMuted: string;
    toggleIcon: string;
    linkBase: string;
    linkHover: string;
    linkActive: string;
    badgeAdmin: string;
    badgeDefault: string;
    active: string;
    hover: string;
  };
  header: {
    bg: string;
    border: string;
    subtitle: string;
  };
  panel: {
    bg: string;
    border: string;
    text: string;
    textMuted: string;
    divider: string;
  };
  badges: {
    success: string;
    danger: string;
    warning: string;
    info: string;
  };
  buttons: {
    primary: string;
    secondary: string;
    ghost: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
  };
  surface: string;
  input: string;
  listDivider: string;
  button: {
    primary: string;
    secondary: string;
  };
  timeline: {
    border: string;
    headerBg: string;
    headerText: string;
    hourBg: string;
    stripeEven: string;
    stripeOdd: string;
    today: string;
  };
}

export const DASHBOARD_THEME: Record<DashboardThemeMode, DashboardThemeConfig> = {
  light: {
    appBg: 'bg-paper-cream notebook-lines',
    contentBg: 'bg-paper-cream',
    sidebar: {
      bg: 'bg-white',
      border: 'border-r-2 border-slate-800',
      text: 'text-slate-900 font-caveat text-lg',
      textMuted: 'text-slate-500',
      toggleIcon: 'text-slate-500 hover:text-slate-900',
      linkBase: 'text-slate-500',
      linkHover: 'hover:bg-marker-yellow/20 hover:text-slate-900',
      linkActive: 'bg-marker-yellow text-slate-900 border-2 border-slate-800',
      badgeAdmin: 'bg-marker-blue text-slate-900',
      badgeDefault: 'bg-slate-200 text-slate-700',
      active: 'bg-marker-yellow border-2 border-slate-800 text-slate-900',
      hover: 'bg-marker-yellow/10',
    },
    header: {
      bg: 'bg-white/90',
      border: 'border-b-2 border-slate-800',
      subtitle: 'text-slate-500 font-caveat',
    },
    panel: {
      bg: 'bg-white',
      border: 'border-2 border-slate-800',
      text: 'text-slate-900 font-patrick text-xl',
      textMuted: 'text-slate-500 font-caveat text-lg',
      divider: 'border-slate-800',
    },
    badges: {
      success: 'bg-marker-green text-green-900',
      danger: 'bg-marker-pink text-red-900',
      warning: 'bg-marker-yellow text-yellow-900',
      info: 'bg-marker-blue text-blue-900',
    },
    buttons: {
      primary: 'bg-marker-blue text-slate-900 border-2 border-slate-800 hover:bg-blue-200',
      secondary: 'bg-white text-slate-900 border-2 border-slate-800 hover:bg-slate-50',
      ghost: 'border-2 border-slate-800 text-slate-700 hover:bg-marker-yellow/20 hover:text-slate-900',
      success: 'bg-marker-green text-slate-900 border-2 border-slate-800 hover:bg-green-200',
      danger: 'bg-marker-pink text-slate-900 border-2 border-slate-800 hover:bg-pink-200',
      warning: 'bg-marker-yellow text-slate-900 border-2 border-slate-800 hover:bg-yellow-200',
      info: 'bg-marker-blue text-slate-900 border-2 border-slate-800 hover:bg-blue-200',
    },
    surface: 'bg-white text-slate-900 border-2 border-slate-800',
    input: 'bg-white border-2 border-slate-800 text-slate-900 focus:ring-marker-blue/50 placeholder-slate-400',
    listDivider: 'border-slate-800',
    button: {
      primary: 'bg-marker-blue',
      secondary: 'bg-white',
    },
    timeline: {
      border: 'border-slate-800',
      headerBg: 'bg-marker-yellow/20',
      headerText: 'text-slate-900',
      hourBg: 'bg-marker-yellow/10',
      stripeEven: 'bg-white',
      stripeOdd: 'bg-paper-cream',
      today: 'bg-marker-blue/30',
    },
  },
  dark: {
    appBg: 'bg-paper-dark notebook-lines',
    contentBg: 'bg-paper-dark',
    sidebar: {
      bg: 'bg-slate-900',
      border: 'border-r-2 border-slate-600',
      text: 'text-chalk-white font-caveat text-lg',
      textMuted: 'text-slate-400',
      toggleIcon: 'text-slate-400 hover:text-white',
      linkBase: 'text-slate-400',
      linkHover: 'hover:bg-slate-800 hover:text-white',
      linkActive: 'bg-slate-800 text-chalk-blue border-2 border-chalk-blue',
      badgeAdmin: 'bg-slate-700 text-chalk-blue',
      badgeDefault: 'bg-slate-800 text-slate-400',
      active: 'bg-slate-800 border-2 border-slate-600 text-white',
      hover: 'bg-slate-800',
    },
    header: {
      bg: 'bg-slate-900/95',
      border: 'border-b-2 border-slate-600',
      subtitle: 'text-slate-400 font-caveat',
    },
    panel: {
      bg: 'bg-slate-800',
      border: 'border-2 border-slate-600',
      text: 'text-white font-patrick text-xl',
      textMuted: 'text-slate-400 font-caveat text-lg',
      divider: 'border-slate-600',
    },
    badges: {
      success: 'bg-green-900 text-green-200 border border-green-700',
      danger: 'bg-red-900 text-red-200 border border-red-700',
      warning: 'bg-yellow-900 text-yellow-200 border border-yellow-700',
      info: 'bg-blue-900 text-blue-200 border border-blue-700',
    },
    buttons: {
      primary: 'bg-slate-700 text-white border-2 border-chalk-blue hover:bg-slate-600 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]',
      secondary: 'bg-slate-800 text-white border-2 border-slate-500 hover:bg-slate-700',
      ghost: 'border-2 border-slate-600 text-slate-400 hover:border-white hover:text-white',
      success: 'bg-green-800 text-white border-2 border-green-500 hover:bg-green-700',
      danger: 'bg-red-800 text-white border-2 border-red-500 hover:bg-red-700',
      warning: 'bg-yellow-800 text-white border-2 border-yellow-500 hover:bg-yellow-700',
      info: 'bg-blue-800 text-white border-2 border-blue-500 hover:bg-blue-700',
    },
    surface: 'bg-slate-900 text-white border-2 border-slate-600',
    input: 'bg-slate-800 border-2 border-slate-600 text-white focus:ring-chalk-blue placeholder-slate-500',
    listDivider: 'border-slate-600',
    button: {
      primary: 'bg-blue-800',
      secondary: 'bg-slate-800',
    },
    timeline: {
      border: 'border-slate-600',
      headerBg: 'bg-slate-800',
      headerText: 'text-white',
      hourBg: 'bg-slate-800',
      stripeEven: 'bg-slate-900',
      stripeOdd: 'bg-slate-950',
      today: 'bg-blue-900/40',
    },
  },
};

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

export const DECORATION = {
  CIRCLE: 'hand-drawn-circle',
  UNDERLINE: 'hand-drawn-underline',
  HIGHLIGHT: 'bg-marker-yellow/60',
  HIGHLIGHT_BLUE: 'bg-marker-blue/60',
  HIGHLIGHT_GREEN: 'bg-marker-green/60',
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