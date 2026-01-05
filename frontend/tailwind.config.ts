import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './App.{ts,tsx}',
    './components/**/*.{ts,tsx,jsx,js}',
    './pages/**/*.{ts,tsx,jsx,js}',
    './utils/**/*.{ts,tsx,js,jsx}',
    './contexts/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
        patrick: ['Patrick Hand', 'cursive'],
        indie: ['Indie Flower', 'cursive'],
      },
      colors: {
        'deep-navy': '#0f172a', // Legacy, keep for now but re-map if needed
        'light-navy': '#1e293b', // Re-mapped for dark mode cards below
        'accent-blue': '#1e3a8a', // Re-mapped to ink-blue for light mode, will handle dark below
        'soft-gray': '#94a3b8',
        'light-slate': '#cbd5e1',
        'light-bg': '#fffcf0', // Re-mapped to paper-cream
        'light-card': '#ffffff',
        'light-accent': '#1e3a8a', // Re-mapped to ink-blue
        'light-text': '#1e293b', // Re-mapped to ink-black
        'light-muted': '#64748b',
        'status-success': '#10b981',
        'status-success-dark': '#047857',
        'status-success-bright': '#34d399',
        'status-success-muted': '#ecfdf5',
        'status-danger': '#ef4444',
        'status-danger-dark': '#b91c1c',
        'status-danger-bright': '#f87171',
        'status-danger-muted': '#fef2f2',
        'status-warning': '#f59e0b',
        'status-warning-dark': '#b45309',
        'status-warning-muted': '#fffbeb',
        'ink-blue': '#1e3a8a', // Dark blue pen
        'ink-black': '#1e293b', // Dark slate pen
        'chalk-white': '#f1f5f9', // Slate 100
        'chalk-blue': '#93c5fd', // Blue 300
        'paper-dark': '#0f172a', // Slate 900
        // Notebook markers & highlights
        'marker-yellow': '#fef08a',
        'marker-blue': '#bfdbfe',
        'marker-green': '#bbf7d0',
        'marker-pink': '#fbcfe8',
        'marker-orange': '#fed7aa',
        'paper-cream': '#fffcf0',
        'paper-line': '#e5e7eb',
        'paper-line-dark': 'rgba(255, 255, 255, 0.1)',
        // Chat colors
        'chat-dark-bg': '#0a1014',
        'chat-dark-panel': '#111b21',
        'chat-dark-bubble': '#1f2c34',
        'chat-dark-input': '#2a3942',
        'chat-dark-hover': '#374850',
        'chat-dark-border': '#2a3942',
        'chat-light-panel': '#f0f2f5',
        'chat-sender-bubble': '#1D4ED8',
        'chat-sender-bubble-dark': '#1E40AF',
        'chat-reply-border': '#3B82F6',
        'chat-reply-text': '#60A5FA',
        'active-purple': '#9333EA',
        // Social brand colors
        'social-linkedin': '#0077b5',
        // Chart/Visualization colors
        'chart-primary': '#3b82f6',
        'chart-secondary': '#8b5cf6',
        'chart-tertiary': '#06b6d4',
        'chart-success': '#10b981',
        'chart-success-bright': '#34d399',
        'chart-text-dark': '#94a3b8',
        'chart-text-light': '#64748B',
        'chart-grid-dark': '#334155',
        'chart-grid-light': '#E2E8F0',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};

export default config;
