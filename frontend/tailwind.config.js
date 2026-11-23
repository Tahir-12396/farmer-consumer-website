/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kisan: {
          primary: '#246B45',      // Natural agricultural green
          dark: '#174B32',         // Deep forest green
          secondary: '#6B9B63',    // Secondary green
          light: '#E8F2E7',        // Light soft green tint
          bg: '#F8FAF4',           // Fresh cream background
          card: '#FFFFFF',
          text: '#26352A',         // High-contrast deep earthy text
          muted: '#738074',        // Secondary text
          accent: '#E8B75A',       // Golden harvest accent
          border: '#E4E9DF',       // Clean soft border
          danger: '#DC2626',
          warning: '#F59E0B',
          success: '#10B981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(36, 107, 69, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'float': '0 10px 25px -5px rgba(23, 75, 50, 0.15), 0 8px 10px -6px rgba(23, 75, 50, 0.1)',
      }
    },
  },
  plugins: [],
}
