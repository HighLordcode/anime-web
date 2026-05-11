import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#101010',
        bg2: '#181818',
        bg3: '#222222',
        border: '#2a2a2a',
        'border-2': '#333333',
        text: '#e0e0e0',
        muted: '#888888',
        'muted-2': '#555555',
        primary: '#4FC3F7',
        'primary-dark': '#1976D2',
        success: '#43a047',
        error: '#e53935',
        warning: '#fb8c00'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4FC3F7, #1976D2)',
        'gradient-reverse': 'linear-gradient(135deg, #1976D2, #4FC3F7)'
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        lg: '16px'
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        condensed: ['Barlow Condensed', ...defaultTheme.fontFamily.sans]
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.3' }],
        sm: ['12px', { lineHeight: '1.4' }],
        base: ['13px', { lineHeight: '1.5' }],
        lg: ['14px', { lineHeight: '1.6' }],
        xl: ['16px', { lineHeight: '1.6' }],
        '2xl': ['18px', { lineHeight: '1.7' }],
        '3xl': ['22px', { lineHeight: '1.1' }],
        '4xl': ['26px', { lineHeight: '1.1' }],
        '5xl': ['28px', { lineHeight: '1.1' }]
      },
      spacing: {
        '18': '72px',
        '22': '88px'
      }
    }
  },
  plugins: []
}
export default config
