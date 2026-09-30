import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B1F33', 600: '#163A5F' },
        champagne: { DEFAULT: '#D6B36A', light: '#F3D58A' },
        cream: '#FFFDF7',
        appgray: '#F5F7FA',
        success: '#16845B',
        danger: '#C94C4C',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(11, 31, 51, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
