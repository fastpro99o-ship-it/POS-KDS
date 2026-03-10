/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#FF7A00", // Wagba Orange
        "primary-light": "rgba(255, 122, 0, 0.1)", // Light primary for hover
        "primary-shadow": "rgba(255, 122, 0, 0.3)", // Glow
        "background-light": "#FAFAFA", // Slightly broken white for app background
        "surface": "#FFFFFF", // Pure white for cards/panels
        "background-dark": "#1A1D2E", // Dark theme background
        "surface-dark": "#22253A", // Dark theme cards
        "text-main": "#1A1A1A", // Dark gray for excellent readability
        "text-muted": "#757575", // Secondary text
        "border-light": "#E0E0E0", // Soft dividers
        "border-dark": "#2A2D3E"
      },
      fontFamily: {
        "poppins": ["var(--font-poppins)", "sans-serif"],
        "inter": ["var(--font-inter)", "sans-serif"],
        "display": ["var(--font-poppins)", "sans-serif"],
        "sans": ["var(--font-inter)", "sans-serif"]
      },
      borderRadius: { "DEFAULT": "1rem", "md": "0.75rem", "lg": "1rem", "xl": "1.5rem", "2xl": "2rem", "full": "9999px" },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'orange-glow': '0 8px 16px rgba(255, 122, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
