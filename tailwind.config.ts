import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#f0f3f9",
          100: "#d9e2f0",
          200: "#b3c5e1",
          300: "#8da8d2",
          400: "#678bc3",
          500: "#416eb4",
          600: "#1a3a6b",
          700: "#162f56",
          800: "#112441",
          900: "#0b192c",
          950: "#060d16",
        },
        brand: {
          DEFAULT: "#1a3a6b",
          light: "#2952a3",
          dark: "#0f2444",
        },
        accent: {
          DEFAULT: "#c8a84b",
          light: "#d4b86a",
          dark: "#a6882c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "120": "30rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px -2px rgba(0,0,0,0.12), 0 2px 6px -2px rgba(0,0,0,0.06)",
        "card-navy": "0 4px 20px -4px rgba(26,58,107,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
