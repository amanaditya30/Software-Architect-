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
        background: 'rgba(10, 10, 12, 1)',
        card: 'rgba(20, 20, 25, 0.7)',
        border: 'rgba(255, 255, 255, 0.08)',
        primary: {
          DEFAULT: '#8b5cf6', // Violet 500
          hover: '#7c3aed', // Violet 600
        },
        accent: {
          DEFAULT: '#3b82f6', // Blue 500
          success: '#10b981', // Emerald 500
          warning: '#f59e0b', // Amber 500
          danger: '#ef4444', // Red 500
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-flow': 'borderFlow 4s linear infinite',
      },
      keyframes: {
        borderFlow: {
          '0%, 100%': { 'border-color': 'rgba(139, 92, 246, 0.2)' },
          '50%': { 'border-color': 'rgba(59, 130, 246, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
