import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Jost', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#17795C',
          hover: '#136A50',
          soft: '#E6F1EA',
          deep: '#1C4A3C',
        },
        accent: '#E8A33D',
        canvas: '#F6F4ED',
        sidebar: '#FBFAF5',
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#ECEADF',
          strong: '#E5E1D3',
        },
        row: {
          line: '#F3F1E8',
        },
        thead: {
          bg: '#FAF9F4',
        },
        text: {
          DEFAULT: '#22302A',
          mid: '#3C4A42',
          muted: '#75806F',
          faint: '#9AA294',
        },
        success: {
          DEFAULT: '#17795C',
          soft: '#E6F1EA',
        },
        warning: {
          DEFAULT: '#B07818',
          soft: '#FAF1DE',
        },
        info: {
          DEFAULT: '#3D5AA8',
          soft: '#E8EDF6',
        },
        danger: {
          DEFAULT: '#C2482F',
          soft: '#FBEAE4',
          owed: '#B2401F',
        },
        neutral: {
          DEFAULT: '#75806F',
          soft: '#EFEDE4',
        },
        brand: {
          navy: '#1C4A3C',
          gold: '#E8A33D',
          'navy-weak': '#E8EDF6',
          'gold-weak': '#FAF1DE',
          'gold-dark': '#B07818',
        },
      },
      borderRadius: {
        card: '16px',
        control: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(34,48,42,.03)',
        primary: '0 1px 2px rgba(23,121,92,.3)',
      },
    },
  },
  plugins: [],
}

export default config
