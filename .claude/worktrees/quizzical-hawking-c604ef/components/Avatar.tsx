import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// Backgrounds rotate through the brand-aligned palette so a feed feels alive.
const palette = [
  "bg-coral-grad",
  "bg-gold-grad",
  "bg-forest-grad",
  "bg-ink",
  "bg-coral-500",
  "bg-forest-700",
];

export function Avatar({ name, size = 40, verified, className }: { name: string; size?: number; verified?: boolean; className?: string }) {
  const idx = (name.charCodeAt(0) || 0) % palette.length;
  const s = `${size}px`;
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: s, height: s }}>
      <div
        className={cn("rounded-full grid place-items-center text-cream-50 font-bold ring-[1.5px] ring-ink", palette[idx])}
        style={{ width: s, height: s, fontSize: size * 0.38 }}
      >
        {initials(name) || "·"}
      </div>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-cream-50 ring-[1.5px] ring-ink">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none">
            <path d="M8.5 12.2l2.4 2.4 4.6-4.6" stroke="#3E8E5C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </div>
  );
}
