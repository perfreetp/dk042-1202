/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef4fb",
          100: "#d6e5f4",
          200: "#b0cbe9",
          300: "#7ea8da",
          400: "#4a82c7",
          500: "#2a65af",
          600: "#1e4f92",
          700: "#1a3f76",
          800: "#1e3a5f",
          900: "#1b304f",
          950: "#0f1f35",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover":
          "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
