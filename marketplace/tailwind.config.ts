import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand
        primary: {
          DEFAULT: '#1A2057',
          hover: '#12163F',
          soft: '#E7E8F2',
          deep: '#10143A',
        },
        gold: {
          DEFAULT: '#F2B705',
          hover: '#C99A04',
          soft: '#FDF3D6',
        },
        // Neutrals (warm off-white background family)
        bg: '#F6F4ED',
        surface: '#FFFFFF',
        mist: '#AAAAA9',
        border: {
          DEFAULT: '#E6E3DA',
          strong: '#D8D3C4',
        },
        // Text (professional dark gray, not brand-tinted)
        ink: {
          DEFAULT: '#1F2430',
          muted: '#5B6172',
          faint: '#9096A6',
        },
        // Semantic (unchanged across the brand)
        success: { DEFAULT: '#17795C', soft: '#E6F1EA' },
        warning: { DEFAULT: '#B07818', soft: '#FAF1DE' },
        danger: { DEFAULT: '#C2482F', soft: '#FBEAE4' },
        info: { DEFAULT: '#3D5AA8', soft: '#E8EDF6' },
      },
      borderRadius: {
        sm: '9px',
        md: '13px',
        lg: '22px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(26, 32, 87, 0.06)',
        md: '0 4px 16px rgba(26, 32, 87, 0.08)',
        lg: '0 20px 48px rgba(26, 32, 87, 0.16)',
        gold: '0 1px 2px rgba(26, 32, 87, 0.3), 0 10px 22px rgba(242, 183, 5, 0.22)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
}

export default config
