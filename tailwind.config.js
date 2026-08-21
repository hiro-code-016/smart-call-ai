/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070b18',
          900: '#0a1020',
          850: '#0d1426',
          800: '#111a33',
          750: '#15203f',
          700: '#1a2748',
          600: '#243159',
          500: '#2f3d6e',
        },
        brand: {
          50: '#eef0ff',
          100: '#dfe3ff',
          200: '#c2c9ff',
          300: '#9fa8ff',
          400: '#7c83fb',
          500: '#5b5ff0',
          600: '#4a42d6',
          700: '#3c34ab',
          800: '#2f2a85',
          900: '#221f60',
        },
        cyan: {
          400: '#34e0e6',
          500: '#19c8d8',
          600: '#0ea5b8',
        },
        emerald: {
          400: '#34e6a0',
          500: '#10c880',
          600: '#0aa566',
        },
        amber: {
          400: '#fbbf4a',
          500: '#f59e0b',
          600: '#d97f06',
        },
        coral: {
          400: '#ff7a6a',
          500: '#f6544a',
          600: '#e0352b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 30px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(124,131,251,0.35), 0 8px 30px -8px rgba(91,95,240,0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'ring': {
          '0%,100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.4)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'ring': 'ring 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
