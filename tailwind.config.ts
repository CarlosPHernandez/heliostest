import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FBFBFB",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "#FBFBFB",
          foreground: "var(--foreground)",
        },
        'secondary-text': '#4f4f4f',
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { borderColor: 'rgba(37, 99, 235, 0.1)' },
          '50%': { borderColor: 'rgba(37, 99, 235, 0.2)' },
        },
        'fade-in-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'progress-vertical': {
          '0%': { transform: 'scaleY(0)' },
          '40%': { transform: 'scaleY(0.4)' },
          '80%': { transform: 'scaleY(0.8)' },
          '100%': { transform: 'scaleY(1)' }
        },
        'progress': {
          '0%': { transform: 'scaleX(0)' },
          '40%': { transform: 'scaleX(0.4)' },
          '80%': { transform: 'scaleX(0.8)' },
          '100%': { transform: 'scaleX(1)' }
        },
        'orbit': {
          '0%': { 
            transform: 'rotate(0deg)' 
          },
          '100%': { 
            transform: 'rotate(360deg)' 
          }
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '0.2',
            transform: 'scale(0.95)'
          },
          '50%': { 
            opacity: '0.4',
            transform: 'scale(1)'
          }
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade': 'fade 0.4s ease-in-out',
        'progress-vertical': 'progress-vertical 2s ease-in-out infinite',
        'progress': 'progress 2s ease-in-out infinite',
        'orbit': 'orbit 8s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
