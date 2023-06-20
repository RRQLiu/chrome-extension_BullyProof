/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./popup/*.{html, js}", "./options/*.{html, js}", './*.{html, js}'],
  theme: {
    screens: {
      sm: "640px",
      md: "870px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        anektelugu: ["Anek Telugu", "sans-serif"],
        spartan: ["League Spartan", "sans-serif"],
      },
      colors: {
        aquaBlue: "rgb(77, 159, 235)",
        midnightBlue: "rgb(53, 71, 100)",
        light_teal: "#CAFEFF",
        dark_teal: "#67E8F9",
      },
      spacing: {
        112: "28rem",
        128: "32rem",
        144: "36rem",
        160: "40rem"
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
