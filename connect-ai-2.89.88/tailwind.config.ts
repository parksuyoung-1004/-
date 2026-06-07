import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#a78bfa', // purple-400
          DEFAULT: '#8b5cf6', // purple-500
          dark: '#6d28d9', // purple-700
          neon: '#c084fc', // glowing purple
        },
        dark: {
          bg: '#0f172a', // slate-900
          card: '#1e293b', // slate-800
          border: '#334155', // slate-700
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px #c084fc, 0 0 20px #c084fc' },
          '100%': { boxShadow: '0 0 20px #c084fc, 0 0 30px #c084fc' },
        }
      }
    },
  },
  plugins: [],
}
export default config
