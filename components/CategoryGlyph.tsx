import { cn } from "@/lib/utils";

// Minimal monochrome line icons per category — replaces the emoji.
// Each path is hand-tuned 24x24 for sharpness.
const paths: Record<string, React.ReactNode> = {
  generator: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 10v4M12 8v8M16 10v4" />
    </>
  ),
  plumbing: (
    <>
      <path d="M4 8h6v8M14 16h6V8M10 12h4" />
    </>
  ),
  electrical: (
    <>
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7Z" />
    </>
  ),
  ac_hvac: (
    <>
      <path d="M12 3v18M5 6l14 12M5 18l14-12" />
    </>
  ),
  carpentry: (
    <>
      <path d="M3 11l11-8 7 7-11 8z" />
      <path d="M10 18l-5 3" />
    </>
  ),
  painting: (
    <>
      <path d="M4 6h12v4H4z" />
      <path d="M10 10v4h4v4" />
      <circle cx="14" cy="20" r="2" />
    </>
  ),
  tiling: (
    <>
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
    </>
  ),
  cleaning: (
    <>
      <path d="M5 11l4-8h6l4 8" />
      <path d="M5 11v10h14V11z" />
    </>
  ),
  errand: (
    <>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M3 17l4-9h7l4 9" />
    </>
  ),
  delivery: (
    <>
      <rect x="3" y="7" width="13" height="10" rx="1" />
      <path d="M16 11h4v6h-4" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  hairstyling: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M7 14c-2 2-3 5-3 7M17 14c2 2 3 5 3 7" />
    </>
  ),
  tailoring: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M9 8l12 12M9 16L21 4" />
    </>
  ),
  photography: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  data_entry: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 10h2M11 10h2M15 10h2M7 14h10" />
    </>
  ),
  graphic_design: (
    <>
      <path d="M4 20l5-12 4 6 4-3 3 9z" />
      <circle cx="9" cy="6" r="1.5" />
    </>
  ),
  social_media: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 7v10M16 7v10M8 12h8" />
    </>
  ),
  transcription: (
    <>
      <path d="M4 6h16M4 10h12M4 14h16M4 18h8" />
    </>
  ),
  tutoring: (
    <>
      <path d="M3 7l9-4 9 4-9 4z" />
      <path d="M21 11v6M5 9v6c0 2 3 3 7 3s7-1 7-3v-6" />
    </>
  ),
  other: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
};

export function CategoryGlyph({ category, size = 36, className }: { category: string; size?: number; className?: string }) {
  const inner = paths[category] || paths.other;
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl bg-surface-2 ring-1 ring-white/10 text-lime-300 shrink-0",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={Math.round(size * 0.55)}
        height={Math.round(size * 0.55)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {inner}
      </svg>
    </div>
  );
}
