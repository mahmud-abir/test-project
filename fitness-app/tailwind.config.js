/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00D9FF',
        secondary: '#FF6B35',
        success: '#00FF88',
        warning: '#FFD93D',
        'bg-primary': '#0F0F1A',
        'bg-surface': '#1A1A2E',
        'bg-card': '#252540',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0B0',
        'text-muted': '#6B6B7B',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'rotate-loading': 'rotate-loading 1s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #00D9FF' },
          '50%': { boxShadow: '0 0 20px #00D9FF, 0 0 30px #00D9FF' },
        },
        'rotate-loading': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
