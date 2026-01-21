/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NHS Primary Colors
        'nhs-blue': '#005EB8',
        'nhs-blue-dark': '#003087',
        'nhs-blue-bright': '#0072CE',

        // NHS Secondary Colors
        'nhs-green': '#007F3B',
        'nhs-green-dark': '#00401E',
        'nhs-aqua-green': '#00A499',

        // NHS Warning & Status Colors
        'nhs-red': '#DA291C',
        'nhs-red-dark': '#8A1538',
        'nhs-warm-yellow': '#FFB81C',
        'nhs-orange': '#ED8B00',

        // NHS Neutral Colors
        'nhs-dark-grey': '#425563',
        'nhs-mid-grey': '#768692',
        'nhs-pale-grey': '#E8EDEE',

        // NHS Extended Palette
        'nhs-pink': '#AE2573',
        'nhs-purple': '#330072',

        // Semantic Colors
        'text-primary': '#212B32',
        'text-secondary': '#4C6272',
        'text-muted': '#768692',

        // Background Colors
        'bg-page': '#F0F4F5',
        'bg-surface': '#FFFFFF',
        'bg-surface-secondary': '#F0F4F5',

        // Focus Color
        'focus': '#FFB81C',
      },
      fontFamily: {
        'primary': ['Frutiger W01', 'Arial', 'sans-serif'],
        'sans': ['Frutiger W01', 'Arial', 'sans-serif'],
        // Indic language fonts
        'hindi': ['Noto Sans Devanagari', 'Arial', 'sans-serif'],
        'punjabi': ['Noto Sans Gurmukhi', 'Arial', 'sans-serif'],
        'bengali': ['Noto Sans Bengali', 'Arial', 'sans-serif'],
        'gujarati': ['Noto Sans Gujarati', 'Arial', 'sans-serif'],
        'tamil': ['Noto Sans Tamil', 'Arial', 'sans-serif'],
        'urdu': ['Noto Nastaliq Urdu', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }],   // 14px
        'base': ['1rem', { lineHeight: '1.5' }],     // 16px
        'md': ['1.125rem', { lineHeight: '1.5' }],   // 18px
        'lg': ['1.25rem', { lineHeight: '1.4' }],    // 20px
        'xl': ['1.5rem', { lineHeight: '1.3' }],     // 24px
        '2xl': ['1.75rem', { lineHeight: '1.25' }],  // 28px
        '3xl': ['2rem', { lineHeight: '1.2' }],      // 32px
        '4xl': ['2.5rem', { lineHeight: '1.15' }],   // 40px
        '5xl': ['3rem', { lineHeight: '1.1' }],      // 48px
      },
      spacing: {
        'xxs': '0.25rem',  // 4px
        'xs': '0.5rem',    // 8px
        'sm': '0.75rem',   // 12px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '2.5rem',   // 40px
        '3xl': '3rem',     // 48px
        '4xl': '4rem',     // 64px
        '5xl': '5rem',     // 80px
      },
      borderRadius: {
        'sm': '0.25rem',   // 4px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.5rem',   // 24px
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'focus': '0 0 0 3px rgba(255, 184, 28, 0.5)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      // Touch target sizes for WCAG 2.2 compliance
      minWidth: {
        'touch': '44px',      // WCAG AA minimum
        'touch-lg': '48px',   // Recommended for elderly
        'touch-xl': '56px',   // Large touch targets
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1200px',
      },
    },
  },
  plugins: [],
}
