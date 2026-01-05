/**
 * @file Menyimpan konstanta yang digunakan di seluruh aplikasi.
 * Memusatkan nilai-nilai ini di satu tempat membuatnya lebih mudah untuk dikelola.
 */

/**
 * Mendefinisikan struktur untuk item tautan navigasi.
 */
export type NavAction = "ticketing" | "form" | "anonymousChat";

export type NavLink =
  | {
    name: string;
    type: "route";
    href: string;
  }
  | {
    name: string;
    type: "modal";
    action: NavAction;
  };

/**
 * Daftar tautan navigasi yang ditampilkan di Navbar.
 * Menambahkan atau menghapus item di sini akan secara otomatis memperbarui navigasi.
 */
export const NAV_LINKS: NavLink[] = [
  { name: 'Diskusi', type: 'route', href: '/discussions' },
  { name: 'Ticketing', type: 'modal', action: 'ticketing' },
  { name: 'Form', type: 'modal', action: 'form' },
  { name: 'Anonymous Chat', type: 'modal', action: 'anonymousChat' },
  { name: 'Backend Lainnya', type: 'route', href: '/login' },
];

/**
 * Konstanta warna untuk penggunaan di JavaScript/TypeScript
 * Warna-warna ini harus sinkron dengan tailwind.config.ts
 */
export const COLORS = {
  // Primary colors
  accentBlue: '#3b82f6',
  lightAccent: '#2563EB',
  deepNavy: '#0f172a',
  lightNavy: '#1e293b',

  // Status colors
  success: '#10b981',
  successBright: '#34d399',
  successDark: '#047857',
  danger: '#ef4444',
  dangerBright: '#f87171',
  warning: '#f59e0b',

  // Chart/Visualization colors
  chart: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    tertiary: '#06b6d4',
    success: '#10b981',
    successBright: '#34d399',
    textDark: '#94a3b8',
    textLight: '#64748B',
    gridDark: '#334155',
    gridLight: '#E2E8F0',
  },

  // Particle colors
  particles: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],

  // Chat colors
  chat: {
    darkBg: '#0a1014',
    darkPanel: '#111b21',
    darkBubble: '#1f2c34',
    darkInput: '#2a3942',
    darkHover: '#374850',
    lightPanel: '#f0f2f5',
    senderBubble: '#1D4ED8',
    senderBubbleDark: '#1E40AF',
    replyBorder: '#3B82F6',
    replyText: '#60A5FA',
  },

  // Social brand colors
  social: {
    linkedin: '#0077b5',
  },
} as const;

