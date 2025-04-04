
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'], // Set Quicksand as the default font
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          light: 'hsl(45, 70%, 98%)', // Base brand color
          DEFAULT: 'hsl(45, 70%, 90%)',
          dark: 'hsl(45, 70%, 85%)',
          accent: '#f1c40f',
        },
        primary: {
          DEFAULT: "#B8860B", // Dark gold
          foreground: "#FFFFFF",
          100: "#FFF8DC", // Cornsilk
          200: "#FFE4B5", // Moccasin
          300: "#FFD700", // Gold
          400: "#DAA520", // Goldenrod
          500: "#B8860B", // Dark goldenrod
          600: "#966909", // Darker gold
          700: "#7C5707", // Even darker gold
          800: "#634505", // Very dark gold
          900: "#4A3403", // Extremely dark gold
          blue: '#3498db',
          green: '#2ecc71',
        },
        secondary: {
          DEFAULT: "#8B4513", // Saddle brown
          foreground: "#FFFFFF",
          100: "#FFF5E6",
          200: "#FFE4B5",
          300: "#DEB887",
          400: "#CD853F",
          500: "#8B4513",
          600: "#73370F",
          700: "#5C2A0B",
          800: "#441E07",
          900: "#2D1303",
        },
        accent: {
          DEFAULT: "#FFD700",
          foreground: "#000000",
        },
        neutral: {
          text: '#333333',
          muted: '#666666',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  corePlugins: {
    preflight: true,
  },
  // Add custom utility classes
  safelist: [
    'btn-gold-gradient',
    'btn-gold-gradient-hover',
    'gradient-text'
  ],
} satisfies Config;
