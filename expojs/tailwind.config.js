/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#60A5FA',
          dark: '#1E40AF',
          container: '#2563EB',
        },
        secondary: {
          DEFAULT: '#494949',
          light: '#AAAAAA',
          dark: '#222222',
          container: '#494949',
        },
        background: {
          light: '#F5F5F5',
          dark: '#222222',
        },
        surface: {
          light: '#FFFFFF',
          dark: 'rgba(30, 30, 30, 0.6)',
        },
        status: {
          success: '#1AAE6F',
          warning: '#FBBF24',
          error: '#FF6B6B',
          info: '#2563EB',
        },
        stat: {
          blue: '#2563EB',
          green: '#1AAE6F',
          orange: '#F59E0B',
          purple: '#7C3AED',
          red: '#EF4444',
        },
        // Custom added for specific web parity
        glass: {
          border: 'rgba(255, 255, 255, 0.1)',
          surface: 'rgba(30, 30, 30, 0.6)',
        }
      },
    },
  },
  plugins: [],
};
