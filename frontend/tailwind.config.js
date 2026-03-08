/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* On garde tes couleurs JPM d'origine */
        jpm: {
          black: '#050505',
          gold: '#D4AF37',
          'gold-dim': '#8A7E55',
          'gold-light': '#EEDC9A',
          surface: '#121212',
        },
        /* Variables HSL pour Lovable et tes pages de gestion */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #AA8A25 100%)',
        'luxury-dark': 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 40px hsl(40 52% 58% / 0.15)" },
          "50%": { boxShadow: "0 0 80px hsl(40 52% 58% / 0.3)" },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        'accordion-down': 'accordion-down 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};