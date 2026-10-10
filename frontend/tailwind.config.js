/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F7F4',
          100: '#E1EDE5',
          200: '#C2DBCB',
          300: '#9BC3AA',
          400: '#6FA784',
          500: '#4A8C63',
          600: '#35714E',
          700: '#2A583D',
          800: '#214430',
          900: '#1B3B2B',
          950: '#0F2319',
        },
        sage: {
          50: '#F6F8F5',
          100: '#EAEEE8',
          200: '#D6DFD2',
          300: '#BACAB3',
          400: '#9DB392',
          500: '#8DA382',
          600: '#6E8563',
          700: '#53654B',
          800: '#42503C',
          900: '#384233',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F3',
          200: '#F4EFE6',
          300: '#EDE5D6',
          400: '#DFD3BD',
          500: '#CFBF9F',
          DEFAULT: '#FBF9F4',
        },
        earth: {
          50: '#F8F6F4',
          100: '#EFEBE7',
          200: '#DED6CE',
          300: '#C8BAB0',
          400: '#A99384',
          500: '#8E7766',
          600: '#755F50',
          700: '#5F4B3E',
          800: '#4A3B31',
          900: '#3A2E27',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'natural': '0 4px 20px -2px rgba(27, 59, 43, 0.08), 0 2px 6px -1px rgba(27, 59, 43, 0.04)',
        'natural-lg': '0 10px 30px -4px rgba(27, 59, 43, 0.12), 0 4px 12px -2px rgba(27, 59, 43, 0.06)',
      }
    },
  },
  plugins: [],
}
