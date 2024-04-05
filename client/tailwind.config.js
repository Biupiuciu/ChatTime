/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {borderWidth: {
      DEFAULT: '1px',
      '1.5': '1.5px',
      },
      colors: {
        'dark': '#353834',
        'medium': '#9CA3AF',
      },},
  plugins: [],
}
}
