/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#243B53',
          dark: '#102A43',
          light: '#334E68',
        },
        golden: {
          DEFAULT: '#E6A23C',
          light: '#F5C06D',
          dark: '#CF8417',
        },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        textPrimary: '#172B4D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
