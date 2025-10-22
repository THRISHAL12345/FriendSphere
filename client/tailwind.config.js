/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // --- ADD THIS BLOCK ---
      colors: {
        primary: {
          DEFAULT: "#6D28D9", // A nice violet
          light: "#8B5CF6",
          dark: "#5B21B6",
        },
        secondary: "#10B981", // A teal/green
        accent: "#EC4899", // A pink
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      // --- END OF ADDED BLOCK ---
    },
  },
  plugins: [],
};
