/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        // haX.baby warm color palette & sensory nursery tones
        hax: {
          cream: '#fff8f1',       // warm cream background / dialog card
          creamLight: '#fffcf7',  // soft silk highlight
          berry: '#a34063',       // vintage velvet berry / rose accent
          berryDark: '#7e2d49',   // deep burgundy shadow
          wood: '#5c4033',        // warm antique polished walnut
          woodLight: '#8a624a',   // light honey oak
          honey: '#e2a76f',       // natural wood finish
          brass: '#d49b42',       // burnished brass & golden clockwork
          brassGlow: '#f4d06f',   // starlight & glowing lanterns
          indigo: '#1f1b2c',      // bedtime celestial midnight
          indigoSoft: '#2e253c',  // dusk sky gradient
          blush: '#ffd1dc',       // soft nursery pink
          sky: '#cbe3fb',         // gentle morning sky
          mint: '#d8f3dc',        // calming herbal mint
          peach: '#ffe5b4'        // candlelight peach
        }
      },
      fontFamily: {
        fredoka: ['Fredoka', 'Quicksand', 'sans-serif'],
        storybook: ['"Playfair Display"', 'Georgia', 'serif'],
        tactile: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'tactile': '0 10px 25px -5px rgba(92, 64, 51, 0.15), 0 8px 10px -6px rgba(92, 64, 51, 0.1)',
        'tactile-lg': '0 20px 35px -8px rgba(92, 64, 51, 0.22), 0 10px 15px -5px rgba(92, 64, 51, 0.12)',
        'tactile-pressed': 'inset 0 4px 8px rgba(92, 64, 51, 0.25)',
        'brass-glow': '0 0 25px rgba(244, 208, 111, 0.45)',
        'berry-glow': '0 0 20px rgba(163, 64, 99, 0.35)',
        'wood-bevel': 'inset 0 2px 0 rgba(255, 255, 255, 0.35), inset 0 -3px 0 rgba(0, 0, 0, 0.25), 0 8px 16px rgba(92, 64, 51, 0.3)'
      },
      animation: {
        'wobble-soft': 'wobbleSoft 1.2s ease-in-out infinite',
        'pirouette': 'pirouette 8s linear infinite',
        'key-wind': 'keyWind 0.4s ease-out',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'gentle-pulse': 'gentlePulse 2.5s ease-in-out infinite',
        'sparkle': 'sparkle 1.8s ease-in-out infinite',
        'page-flip': 'pageFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      keyframes: {
        wobbleSoft: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' }
        },
        pirouette: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' }
        },
        keyWind: {
          '0%': { transform: 'rotate(0deg) scale(0.95)' },
          '50%': { transform: 'rotate(45deg) scale(1.05)' },
          '100%': { transform: 'rotate(90deg) scale(1)' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        gentlePulse: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' }
        },
        sparkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(15deg)' }
        },
        pageFlip: {
          '0%': { transform: 'rotateY(0deg)', transformOrigin: 'left center' },
          '100%': { transform: 'rotateY(-180deg)', transformOrigin: 'left center' }
        }
      }
    }
  },
  plugins: []
};
