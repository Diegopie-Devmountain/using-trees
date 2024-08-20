// https://tailwindcss.com/docs/theme#referencing-the-default-theme
import defaultTheme from"tailwindcss/defaultTheme";
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
    extend: {},
  },
  plugins: [],
}

