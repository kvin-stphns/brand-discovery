/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB",
        foreground: "#1F2937",
        border: "#E5E7EB",
      },
      screens: {
        'mobile': '428px',
        'tablet': '649px',
        'desktop': '1149px',
      },
    },
  },
  plugins: [],
};