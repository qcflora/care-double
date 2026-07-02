/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#FAF9F7',
        'primary': '#7BA394',
        'primary-light': '#A8C4B8',
        'primary-dark': '#5E8A7A',
        'sand': '#E8DCC8',
        'sand-light': '#F3EDE3',
        'lavender': '#9B8AA6',
        'lavender-light': '#C4B8CC',
        'accent': '#D96B5C',
        'accent-light': '#E89A8F',
        'success': '#8FB89B',
        'text-main': '#3D3A36',
        'text-secondary': '#8B8680',
        'text-muted': '#B5B0A8',
        'border': '#E8E5E0',
        'card': '#FFFFFF',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
      borderRadius: {
        'card': '12px',
        'btn': '10px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(61, 58, 54, 0.06)',
      },
    },
  },
  plugins: [],
}
