/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        // Grün aus dem Logo („Ideale“)
        brand: {
          50: '#effaf6',
          100: '#d7f3e9',
          200: '#b0e6d4',
          300: '#7cd3b9',
          400: '#45b99a',
          500: '#23a889',
          600: '#1a8a71',
          700: '#16705d',
          800: '#145a4c',
          900: '#124a3f',
        },
        // Dunkelblau aus dem Logo („Haushaltshilfe“, Herz)
        navy: {
          50: '#f1f4fb',
          100: '#e2e8f6',
          200: '#c6d0ec',
          300: '#9aabdb',
          600: '#384891',
          700: '#2d3a76',
          800: '#1d2a62',
          900: '#13205b',
          950: '#0c1440',
        },
        cream: '#fbf8f3',
        sand: '#f3ede3',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
