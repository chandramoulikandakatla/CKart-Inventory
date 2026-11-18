/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          orange: '#FF6B2C',
          coffee: '#6F4E37',
          darkcoffee: '#4A2E1B',
          espresso: '#2C1A12',
          alabaster: '#FAF7F2',
          sand: '#F5F0EB',
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}
