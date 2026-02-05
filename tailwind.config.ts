import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        reading: ['Crimson Pro', 'Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Genre colors
        genre: {
          thriller: "hsl(var(--genre-thriller))",
          "thriller-glow": "hsl(var(--genre-thriller-glow))",
          classic: "hsl(var(--genre-classic))",
          "classic-glow": "hsl(var(--genre-classic-glow))",
          emotional: "hsl(var(--genre-emotional))",
          "emotional-glow": "hsl(var(--genre-emotional-glow))",
          mystery: "hsl(var(--genre-mystery))",
          "mystery-glow": "hsl(var(--genre-mystery-glow))",
          romance: "hsl(var(--genre-romance))",
          "romance-glow": "hsl(var(--genre-romance-glow))",
          scifi: "hsl(var(--genre-scifi))",
          "scifi-glow": "hsl(var(--genre-scifi-glow))",
        },
        // Reading colors
        reading: {
          bg: "hsl(var(--reading-bg))",
          text: "hsl(var(--reading-text))",
          highlight: "hsl(var(--reading-highlight))",
          pacer: "hsl(var(--reading-pacer))",
        },
        // Progress colors
        progress: {
          ring: "hsl(var(--progress-ring))",
          bg: "hsl(var(--progress-bg))",
        },
        // Emotion colors
        emotion: {
          calm: "hsl(var(--emotion-calm))",
          tense: "hsl(var(--emotion-tense))",
          joy: "hsl(var(--emotion-joy))",
          sadness: "hsl(var(--emotion-sadness))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        soft: "var(--ease-soft)",
        "out-soft": "var(--ease-out)",
        "in-soft": "var(--ease-in)",
        bounce: "var(--ease-bounce)",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(8px)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out forwards",
        "fade-out": "fade-out 0.15s ease-in forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      fontSize: {
        "reading-sm": ["1rem", { lineHeight: "1.8" }],
        "reading-base": ["1.125rem", { lineHeight: "1.85" }],
        "reading-lg": ["1.25rem", { lineHeight: "1.9" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
