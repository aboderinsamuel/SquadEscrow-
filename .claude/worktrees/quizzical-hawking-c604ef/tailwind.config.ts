import type { Config } from "tailwindcss";

// Palette pulled directly from the Squadco Escrow mockup screens:
//   cream parchment background · big black type · coral primary CTA ·
//   forest-green success · gold/orange accent · dark forest cards.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDF8EF",
          100: "#F8F0E2",
          200: "#F4ECDF", // primary page bg
          300: "#EFE5D2",
          400: "#E5D7BA",
          500: "#D7C7AB",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          900: "#0A0A0A",
          800: "#161616",
          700: "#222222",
          600: "#404040",
          500: "#6B6B6B",
          400: "#9C9C9C",
        },
        forest: {
          50: "#E7F4EC",
          100: "#DCF0E4",
          200: "#B6DDC4",
          300: "#7EBE99",
          400: "#5AA77E",
          500: "#3E8E5C",
          600: "#2D7148",
          700: "#1F5234",
          800: "#143824",
          900: "#0E2A1F",
        },
        coral: {
          200: "#FAD3D3",
          300: "#F4A4A4",
          400: "#EE7777",
          500: "#E04848", // primary CTA red
          600: "#C73838",
          700: "#9D2424",
        },
        gold: {
          200: "#FBE2BD",
          300: "#F4C994",
          400: "#F0A04A",
          500: "#E0892E",
          600: "#B86B1B",
          700: "#7E4912",
        },
        // Aliases so existing class names still compile during migration.
        bg: "#F4ECDF",
        surface: {
          0: "#FDF8EF",
          1: "#F8F0E2",
          2: "#EFE5D2",
          3: "#E5D7BA",
        },
        line: {
          DEFAULT: "#1A1A1A",
          strong: "#0A0A0A",
        },
        lime: {
          50: "#E7F4EC", 100: "#DCF0E4", 200: "#B6DDC4", 300: "#7EBE99",
          400: "#5AA77E", 500: "#3E8E5C", 600: "#2D7148", 700: "#1F5234",
          800: "#143824", 900: "#0E2A1F",
        },
        jade: {
          50: "#E7F4EC", 100: "#DCF0E4", 200: "#B6DDC4", 300: "#7EBE99",
          400: "#5AA77E", 500: "#3E8E5C", 600: "#2D7148", 700: "#1F5234",
          800: "#143824", 900: "#0E2A1F",
        },
        amber500: "#F0A04A",
        rose500: "#E04848",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Inter Display", "Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.03em",
      },
      borderRadius: {
        "4xl": "28px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(10,10,10,0.04) inset, 0 1px 2px rgba(10,10,10,0.04), 0 6px 24px -8px rgba(10,10,10,0.08)",
        pop: "0 8px 28px -10px rgba(224,72,72,0.45)",
        soft: "0 2px 12px -4px rgba(10,10,10,0.10)",
      },
      backgroundImage: {
        "coral-grad": "linear-gradient(135deg, #F08A6E 0%, #E04848 60%, #C73838 100%)",
        "forest-grad": "linear-gradient(135deg, #5AA77E 0%, #2D7148 100%)",
        "gold-grad": "linear-gradient(135deg, #F4C994 0%, #F0A04A 60%, #E0892E 100%)",
        "page": "radial-gradient(900px 600px at 90% -10%, rgba(240,160,74,0.18), transparent 60%), radial-gradient(700px 500px at -10% 110%, rgba(224,72,72,0.10), transparent 60%), #F4ECDF",
      },
      keyframes: {
        rise: { "0%": { transform: "translateY(8px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        ping2: { "75%, 100%": { transform: "scale(1.8)", opacity: "0" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        rise: "rise 0.45s ease-out both",
        ping2: "ping2 1.6s cubic-bezier(0,0,0.2,1) infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
