/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#1e293b',
          750: '#273549',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
        cyber: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.35)',
        'glow-rose': '0 0 20px -5px rgba(239, 68, 68, 0.35)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
