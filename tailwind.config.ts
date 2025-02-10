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
          '0%, 100%': { borderColor: 'rgba(59, 130, 246, 0.3)' },
          '50%': { borderColor: 'rgba(59, 130, 246, 0.6)' },
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
        'progress-vertical': {
          '0%': { transform: 'scaleY(0)' },
          '40%': { transform: 'scaleY(0.4)' },
          '80%': { transform: 'scaleY(0.8)' },
          '100%': { transform: 'scaleY(1)' }
        },
        'progress': {
          '0%': { transform: 'scaleX(0)' },
          '50%': { transform: 'scaleX(0.5)' },
          '100%': { transform: 'scaleX(1)' }
        },
        'sun-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'sun-fill': {
          '0%': { 
            opacity: '0.2',
            transform: 'scale(0.8)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'progress-vertical': 'progress-vertical 3s ease-in-out infinite',
        'progress': 'progress 2s ease-in-out infinite',
        'sun-rotate': 'sun-rotate 3s linear infinite',
        'sun-fill': 'sun-fill 2s ease-out forwards'
      },
    },
  },
  plugins: [],
};

export default config;
