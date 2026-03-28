/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // DayWeave-derived sky blues with a warmer, tropical tone
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#4A9CB8',
          600: '#3F7A9A',
          700: '#2E5A6B',
          800: '#1e3a4a',
          900: '#0c2233',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#E6D055',
          400: '#d4b800',
          500: '#b89600',
          600: '#92760a',
          DEFAULT: '#E6D055',
        },
        coral: {
          50:  '#fff5f0',
          100: '#ffebe0',
          200: '#ffd0b5',
          300: '#ffaf80',
          400: '#ff8c4a',
          500: '#f26522',
          DEFAULT: '#ff8c4a',
        },
        navy: '#2E5A6B',
        sand: '#F5EFE0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      screens: {
        xs: '375px',
        sm: '430px',
      },
    },
  },
  plugins: [],
};
