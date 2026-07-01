import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#1d3480',
          gold: '#f9a800',
          'navy-weak': '#e8ecf5',
          'gold-weak': '#fff8e6',
          'gold-dark': '#c07800',
        },
      },
    },
  },
  plugins: [],
}

export default config
