/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0F2942',
          blue: '#1E3A8A',
          gold: '#D97706',
          light: '#F8FAFC',
          dark: '#0F172A',
          border: '#E2E8F0',
          accent: '#2563EB',
          success: '#059669',
          danger: '#DC2626'
        }
      }
    },
  },
  plugins: [],
}
