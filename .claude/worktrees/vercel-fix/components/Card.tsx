import { cn } from "@/lib/utils";

type Tone = "cream" | "white" | "ink" | "forest" | "coral" | "gold";

const toneCls: Record<Tone, string> = {
  cream: "bg-cream-100 ring-1 ring-ink/10 text-ink",
  white: "bg-cream-50 ring-1 ring-ink/10 text-ink",
  ink: "bg-ink-900 text-cream-50",
  forest: "bg-forest-900 text-cream-50",
  coral: "bg-coral-500 text-cream-50",
  gold: "bg-gold-400 text-ink",
};

export function Card({ children, className, padded = true, tone = "white" }: { children: React.ReactNode; className?: string; padded?: boolean; tone?: Tone }) {
  return (
    <div className={cn("rounded-2xl", toneCls[tone], padded && "p-5", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3 px-0.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">{children}</h3>
      {hint && <span className="text-[12px] text-ink/45">{hint}</span>}
    </div>
  );
}
