/** @type {import('tailwindcss').Config} */
// Tailwind v4 — theme customization dilakukan via CSS @theme di index.css
// File ini tetap dibutuhkan untuk content scanning
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}
