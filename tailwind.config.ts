import type { Config } from "tailwindcss";

// ─── Bolt-flavored design system ──────────────────────────────────────────
// Palette redefined from the Squadco mockup (warm cream + coral + forest)
// to Bolt's signature look:
//   · Pure white page backgrounds
//   · Vibrant Bolt-green (#34D186) as the primary CTA / accent
//   · Deep navy-charcoal (#1F2A2E) for dark sections
//   · Bolt yellow (#FFCC00) for top-rated / warning accents
//   · Pure black for primary text
//
// Existing token NAMES are preserved (cream-*, coral-*, forest-*, gold-*)
// so every JSX file picks up the new look without a per-file rename.
// Semantically:
//   - cream-* = white / off-white surfaces
//   - coral-* = bolt-green (primary CTA — yes, green, this is intentional)
//   - forest-* = darker teal-green (dark sections + verified/funded states)
//   - gold-*  = bolt-yellow (top-rated, warning)
//   - ink-*   = unchanged (black text + dark buttons)
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Page + card surfaces — pure white & subtle off-whites (Bolt look).
        cream: {
          50:  "#FFFFFF", // primary card surface
          100: "#FAFAFA", // very subtle off-white
          200: "#FFFFFF", // primary page bg (was warm cream — now white)
          300: "#F4F4F5", // alternating section / hover
          400: "#E5E7EB", // dividers
          500: "#D1D5DB",
        },
        // Black text + dark buttons. Bolt uses pure black.
        ink: {
          DEFAULT: "#0A0A0A",
          900: "#000000",
          800: "#0A0A0A",
          700: "#1A1A1A",
          600: "#404040",
          500: "#6B6B6B",
          400: "#9C9C9C",
        },
        // Bolt's deep teal-green for dark sections; mid-greens for verified/funded.
        forest: {
          50:  "#E8FAF1",
          100: "#D5F4E2",
          200: "#A4E8C0",
          300: "#6FD894",
          400: "#34D186",
          500: "#1FAE6B", // verified worker / funded state
          600: "#15824F",
          700: "#0F5A37",
          800: "#0A3A24",
          900: "#0F1A17", // dark sections — near-black with green undertone
        },
        // Primary CTA — Bolt-green (was coral red).
        coral: {
          200: "#D5F4E2",
          300: "#A4E8C0",
          400: "#34D186",
          500: "#00C24C", // primary CTA (replaces #E04848)
          600: "#009F3F",
          700: "#007B31",
        },
        // Bolt-electric yellow for top-rated / accent.
        gold: {
          200: "#FFF4C7",
          300: "#FFE680",
          400: "#FFCC00", // Bolt yellow
          500: "#E5B800",
          600: "#B89500",
          700: "#7E6500",
        },
        // Aliases kept for compatibility.
        bg: "#FFFFFF",
        surface: {
          0: "#FFFFFF",
          1: "#FAFAFA",
          2: "#F4F4F5",
          3: "#E5E7EB",
        },
        line: {
          DEFAULT: "#E5E7EB",
          strong: "#000000",
        },
        lime: {
          50: "#E8FAF1", 100: "#D5F4E2", 200: "#A4E8C0", 300: "#6FD894",
          400: "#34D186", 500: "#1FAE6B", 600: "#15824F", 700: "#0F5A37",
          800: "#0A3A24", 900: "#0F1A17",
        },
        jade: {
          50: "#E8FAF1", 100: "#D5F4E2", 200: "#A4E8C0", 300: "#6FD894",
          400: "#34D186", 500: "#1FAE6B", 600: "#15824F", 700: "#0F5A37",
          800: "#0A3A24", 900: "#0F1A17",
        },
        amber500: "#FFCC00",
        rose500: "#00C24C",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Inter Display", "Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
      },
      borderRadius: {
        // Bolt uses tighter radii than the original cream design.
        "4xl": "20px",
      },
      boxShadow: {
        // Bolt's shadows are tighter and less colorful.
        card: "0 1px 0 rgba(10,10,10,0.04) inset, 0 1px 2px rgba(10,10,10,0.05), 0 8px 24px -10px rgba(10,10,10,0.08)",
        pop: "0 8px 28px -10px rgba(0,194,76,0.40)",
        soft: "0 2px 12px -4px rgba(10,10,10,0.10)",
      },
      backgroundImage: {
        // Gradients now in the Bolt-green / yellow family.
        "coral-grad": "linear-gradient(135deg, #34D186 0%, #00C24C 60%, #009F3F 100%)",
        "forest-grad": "linear-gradient(135deg, #34D186 0%, #1FAE6B 100%)",
        "gold-grad": "linear-gradient(135deg, #FFE680 0%, #FFCC00 60%, #E5B800 100%)",
        // Page bg — pure white with the faintest green wash.
        "page": "radial-gradient(900px 600px at 90% -10%, rgba(0,194,76,0.06), transparent 60%), radial-gradient(700px 500px at -10% 110%, rgba(255,204,0,0.05), transparent 60%), #FFFFFF",
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
