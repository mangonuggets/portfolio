/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#ffd1dc',
        'pastel-pink-light': '#ffe6eb',
        'pastel-pink-dark': '#ffaec0',
        'red-light': '#ffaec2',
      },
      fontFamily: {
        'sans': ['Montserrat', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      gridTemplateRows: {
        'masonry': 'masonry'
      }
    },
  },
  plugins: [],
}
