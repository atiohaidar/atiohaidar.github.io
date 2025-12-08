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
      },
      colors: {
        'deep-navy': '#0f172a', // Darker navy for better contrast
        'light-navy': '#1e293b',
        'accent-blue': '#3b82f6',
        'soft-gray': '#94a3b8',
        'light-slate': '#cbd5e1',
        'light-bg': '#f8fafc',
        'light-card': '#ffffff',
        'light-accent': '#2563EB',
        'light-text': '#0f172a',
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
        'status-info': '#3b82f6',
        'status-info-muted': '#eff6ff',
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
