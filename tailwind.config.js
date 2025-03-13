/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./components/**/*.{html,js}",
    "./js/**/*.js",
    "./functions/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#ffd1dc',
        'pastel-pink-light': '#ffe6eb',
        'pastel-pink-dark': '#ffaec0',
        'pastel-blue': '#b5d8ff',
        'pastel-blue-light': '#d9ecff',
        'pastel-blue-dark': '#8fc1ff',
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
