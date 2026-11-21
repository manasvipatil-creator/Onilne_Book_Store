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
          subtle: '#F0F4F8',
        },
        golden: {
          DEFAULT: '#E6A23C',
          light: '#F5C06D',
          dark: '#CF8417',
          subtle: '#FDF6EC',
        },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        textPrimary: '#172B4D',
        textSecondary: '#627D98',
        borderMuted: '#E2E8F0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 25px -5px rgba(36, 59, 83, 0.08), 0 8px 10px -6px rgba(36, 59, 83, 0.05)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
