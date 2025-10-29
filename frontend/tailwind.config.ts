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
        'deep-navy': '#222222',
        'light-navy': '#494949',
        'accent-blue': '#2563EB',
        'soft-gray': '#AAAAAA',
        'light-slate': '#D0D0D0',
        'light-bg': '#F5F5F5',
        'light-card': '#FFFFFF',
        'light-accent': '#2563EB',
        'light-text': '#1F2937',
        'light-muted': '#6B7280',
        'status-success': '#1AAE6F',
        'status-success-dark': '#0F8A4B',
        'status-success-bright': '#61DE9B',
        'status-success-muted': '#E6F9EF',
        'status-danger': '#FF6B6B',
        'status-danger-dark': '#C44545',
        'status-danger-bright': '#FF9A9A',
        'status-danger-muted': '#FDECEC',
        'status-warning': '#FBBF24',
        'status-warning-dark': '#B45309',
        'status-warning-muted': '#FEF3C7',
        'status-info': '#1F6FEB',
        'status-info-muted': '#D6E4FF',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};

export default config;
