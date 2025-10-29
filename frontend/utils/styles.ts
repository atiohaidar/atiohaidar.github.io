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
 * Color classes - Theme aware (using Tailwind dark: modifier)
 */
export const COLORS = {
  // Backgrounds
  BG_PRIMARY: 'bg-light-bg dark:bg-deep-navy',
  BG_SECONDARY: 'bg-light-card dark:bg-light-navy',
  PANEL: 'bg-white dark:bg-[#2B303A]',
  
  // Text colors
  TEXT_PRIMARY: 'text-light-text dark:text-white',
  TEXT_SECONDARY: 'text-light-muted dark:text-soft-gray',
  TEXT_MUTED: 'text-light-muted dark:text-light-slate',
  TEXT_ACCENT: 'text-light-accent dark:text-accent-blue',
  TEXT_WHITE: 'text-light-text dark:text-white',
  
  // Borders
  BORDER: 'border-gray-300 dark:border-[#3F4654]',
  BORDER_ACCENT: 'border-light-accent dark:border-accent-blue',
  
  // Backgrounds with accent
  BG_ACCENT: 'bg-light-accent dark:bg-accent-blue',
  BUTTON_PRIMARY: 'bg-light-accent dark:bg-accent-blue',
  
  // Hover states
  HOVER_ACCENT: 'hover:bg-light-accent/10 dark:hover:bg-accent-blue/10',
  HOVER_TEXT_PRIMARY: 'hover:text-light-text dark:hover:text-deep-navy',
  HOVER_TEXT_ACCENT: 'hover:text-light-accent dark:hover:text-accent-blue',
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
    appBg: 'bg-[#F5F7FB]',
    contentBg: 'bg-[#F5F7FB]',
    sidebar: {
      bg: 'bg-white',
      border: 'border-r border-[#E1E8F5]',
      text: 'text-[#1A2136]',
      textMuted: 'text-[#5B6887]',
      toggleIcon: 'text-[#5B6887] hover:text-[#1A2136]',
      linkBase: 'text-[#5B6887]',
      linkHover: 'hover:bg-[#EEF4FF] hover:text-[#1A2136]',
      linkActive: 'bg-[#1F6FEB]/10 text-[#1F6FEB] border border-[#1F6FEB]/40',
      badgeAdmin: 'bg-[#1F6FEB]/12 text-[#1F6FEB]',
      badgeDefault: 'bg-[#E8EBF2] text-[#5B6887]',
      active: 'bg-[#EEF4FF] border border-[#D6E2FF] text-[#1A2136]',
      hover: 'bg-[#F2F7FF]',
    },
    header: {
      bg: 'bg-white/90',
      border: 'border-b border-[#E1E8F5]',
      subtitle: 'text-[#5B6887]',
    },
    panel: {
      bg: 'bg-white',
      border: 'border border-[#E1E8F5]',
      text: 'text-[#1A2136]',
      textMuted: 'text-[#5B6887]',
      divider: 'border-[#E1E8F5]',
    },
    badges: {
      success: 'bg-status-success-muted text-status-success-dark',
      danger: 'bg-status-danger-muted text-status-danger-dark',
      warning: 'bg-status-warning-muted text-status-warning-dark',
      info: 'bg-status-info-muted text-status-info',
    },
    buttons: {
      primary: 'bg-accent-blue text-white hover:bg-accent-blue/90',
      secondary: 'bg-[#EEF2FA] text-[#1A2136] hover:bg-[#E3E8F6]',
      ghost: 'border border-[#CBD5E1] text-[#5B6887] hover:border-accent-blue hover:text-accent-blue',
      success: 'bg-status-success text-white hover:bg-status-success-dark',
      danger: 'bg-status-danger text-white hover:bg-status-danger-dark',
      warning: 'bg-status-warning text-white hover:bg-status-warning-dark',
      info: 'bg-status-info text-white hover:bg-status-info/90',
    },
    surface: 'bg-white text-[#1A2136]',
    input: 'bg-white border border-[#CBD5E1] text-[#1A2136] focus:border-[#1F6FEB] focus:ring-[#1F6FEB]/15',
    listDivider: 'border-[#E1E8F5]',
    button: {
      primary: 'bg-accent-blue',
      secondary: 'bg-[#EEF2FA]',
    },
    timeline: {
      border: 'border-[#E1E8F5]',
      headerBg: 'bg-[#EEF2FA]',
      headerText: 'text-[#1A2136]',
      hourBg: 'bg-[#EEF2FA]',
      stripeEven: 'bg-[#F8FAFF]',
      stripeOdd: 'bg-white',
      today: 'bg-[#1F6FEB]/10',
    },
  },
  dark: {
    appBg: 'bg-[#0D111A]',
    contentBg: 'bg-[#0D111A]',
    sidebar: {
      bg: 'bg-[#121721]',
      border: 'border-r border-[#2F3542]',
      text: 'text-[#CED7EA]',
      textMuted: 'text-[#8E9CB3]',
      toggleIcon: 'text-[#8E9CB3] hover:text-white',
      linkBase: 'text-[#8E9CB3]',
      linkHover: 'hover:bg-[#1F2633] hover:text-white',
      linkActive: 'bg-accent-blue/20 text-white border border-accent-blue/40',
      badgeAdmin: 'bg-accent-blue/15 text-accent-blue',
      badgeDefault: 'bg-[#2F3542] text-[#8E9CB3]',
      active: 'bg-[#1F2633] border border-accent-blue/40 text-white',
      hover: 'bg-[#1F2633]',
    },
    header: {
      bg: 'bg-[#151B26]/95',
      border: 'border-b border-[#2F3542]',
      subtitle: 'text-[#8E9CB3]',
    },
    panel: {
      bg: 'bg-[#1A2230]',
      border: 'border border-[#2F3542]',
      text: 'text-white',
      textMuted: 'text-[#A8B4CC]',
      divider: 'border-[#2F3542]',
    },
    badges: {
      success: 'bg-status-success/20 text-status-success-bright',
      danger: 'bg-status-danger/20 text-status-danger-bright',
      warning: 'bg-status-warning/20 text-status-warning-muted',
      info: 'bg-status-info/20 text-status-info',
    },
    buttons: {
      primary: 'bg-accent-blue text-white hover:bg-accent-blue/90',
      secondary: 'bg-[#1F2633] text-[#CED7EA] hover:bg-[#252E3D]',
      ghost: 'border border-[#2F3542] text-[#8E9CB3] hover:border-accent-blue hover:text-accent-blue',
      success: 'bg-status-success text-white hover:bg-status-success-dark',
      danger: 'bg-status-danger text-white hover:bg-status-danger-dark',
      warning: 'bg-status-warning text-white hover:bg-status-warning-dark',
      info: 'bg-status-info text-white hover:bg-status-info/90',
    },
    surface: 'bg-[#1A2230] text-white',
    input: 'bg-[#1F2633] border border-[#2F3542] text-white focus:border-accent-blue focus:ring-accent-blue/20',
    listDivider: 'border-[#2F3542]',
    button: {
      primary: 'bg-accent-blue',
      secondary: 'bg-[#1F2633]',
    },
    timeline: {
      border: 'border-[#2F3542]',
      headerBg: 'bg-[#1A2230]',
      headerText: 'text-white',
      hourBg: 'bg-[#1A2230]',
      stripeEven: 'bg-[#1F2633]',
      stripeOdd: 'bg-[#141A24]',
      today: 'bg-accent-blue/10',
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