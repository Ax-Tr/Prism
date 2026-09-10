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
        prism: {
          bg: {
            dark: '#050505',
            light: '#f2f0eb',
          },
          surface: {
            dark: '#0b0f19',
            light: '#ffffff',
          },
          border: {
            dark: '#1e293b',
            light: '#e2e8f0',
          },
          cyan: '#38bdf8',
          purple: '#c084fc',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          orange: '#fb923c',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
      }
    },
  },
  plugins: [],
}
