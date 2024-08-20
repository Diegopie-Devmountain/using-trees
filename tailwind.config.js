import defaultTheme from"tailwindcss/defaultTheme";
// https://tailwindcss.com/docs/theme#referencing-the-default-theme
/** @type {import('tailwindcss').Config} */ 
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      "poppins": ['"Poppins"', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      colors: {
        "brand-orange": {
          100: "#fdba74",
          300: "#d49c61",
          500: "#a1764a"
        },
        "cool-blue": "#94c1ff"
      }
    },
  },
  plugins: [],
}

