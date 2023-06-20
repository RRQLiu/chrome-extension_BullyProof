/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./temp_frontend/**/*.{html,js}'],
  theme: {
    extend: {
        colors: {
        aquaBlue: "rgb(77, 159, 235)",
        midnightBlue: "#2B3E5B",
      },
    },
  },
  plugins: [],
}
