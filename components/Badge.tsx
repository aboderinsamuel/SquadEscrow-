import { cn } from "@/lib/utils";

type Tone = "ink" | "cream" | "forest" | "coral" | "gold" | "neutral" | "outline" |
            // legacy aliases
            "lime" | "jade" | "rose" | "amber" | "blue";

export function Badge({ children, tone = "ink", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  const tones: Record<Tone, string> = {
    ink: "bg-ink text-cream-50",
    cream: "bg-cream-50 text-ink ring-1 ring-ink/10",
    forest: "bg-forest-500 text-cream-50",
    coral: "bg-coral-500 text-cream-50",
    gold: "bg-gold-400 text-ink",
    neutral: "bg-ink/8 text-ink/70",
    outline: "bg-transparent text-ink ring-1 ring-ink/20",
    // legacy
    lime: "bg-forest-500 text-cream-50",
    jade: "bg-forest-500 text-cream-50",
    rose: "bg-coral-500 text-cream-50",
    amber: "bg-gold-400 text-ink",
    blue: "bg-ink text-cream-50",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight", tones[tone], className)}>
      {children}
    </span>
  );
}
