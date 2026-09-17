/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: '#f9e4e9',
        'blush-dark': '#f0c5cf',
        rose: '#e8b4be',
        'rose-dark': '#d4899a',
        'dusty-pink': '#c9748a',
        'deep-rose': '#a0354f',
        burgundy: '#6b1530',
        'dark-burgundy': '#4a0f22',
        cream: '#fdf6f0',
        peach: '#f5c9b0',
        'peach-dark': '#e8a882',
        'warm-white': '#fffaf8',
        'soft-gold': '#d4a853',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        'float-heart': 'floatHeart 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        floatHeart: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'rose-glow': '0 0 30px rgba(200, 116, 138, 0.3)',
        'rose-glow-lg': '0 0 60px rgba(200, 116, 138, 0.4)',
        'glass': '0 8px 32px rgba(107, 21, 48, 0.15)',
        'card': '0 4px 24px rgba(107, 21, 48, 0.12)',
        'card-hover': '0 20px 60px rgba(107, 21, 48, 0.25)',
      },
    },
  },
  plugins: [],
}
