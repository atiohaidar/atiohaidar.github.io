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
          DEFAULT: '#6200ee',
          light: '#bb86fc',
          dark: '#3700b3',
          container: '#bb86fc',
        },
        secondary: {
          DEFAULT: '#03dac6',
          light: '#66fff9',
          dark: '#00a896',
          container: '#018786',
        },
        background: {
          light: '#f5f5f5',
          dark: '#121212',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e1e1e',
        },
        status: {
          success: '#4caf50',
          warning: '#ff9800',
          error: '#b00020',
          info: '#2196f3',
        },
        stat: {
          blue: '#2196F3',
          green: '#4CAF50',
          orange: '#FF9800',
          purple: '#9C27B0',
          red: '#F44336',
        },
      },
    },
  },
  plugins: [],
};
