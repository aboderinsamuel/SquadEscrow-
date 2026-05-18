import { cn } from "@/lib/utils";

export function Logo({ className, size = 28, dark = false }: { className?: string; size?: number; dark?: boolean }) {
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const bg = dark ? "#0A0A0A" : "#FFFFFF";
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="self-center">
        {/* Coin-like rounded square — the brand mark for an escrow vault */}
        <rect x="1" y="1" width="30" height="30" rx="9" fill={fg} />
        {/* Stylised S — two interlocking curves form the escrow knot */}
        <path
          d="M21.5 11.2c-1-1.6-2.9-2.6-5.1-2.6-3.1 0-5.4 1.7-5.4 4.1 0 2.1 1.6 3.2 4.6 3.8l1.8.3c2.5.5 3.6 1.3 3.6 2.7 0 1.6-1.8 2.7-4.5 2.7-2.4 0-4.3-.9-5.4-2.5"
          stroke={bg}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Escrow indicator — the coral dot signals "funds locked" */}
        <circle cx="24.5" cy="8.5" r="2.6" fill="#00C24C" stroke={fg} strokeWidth="1.2" />
      </svg>
      <span className={cn("text-[1.05em] font-bold tracking-tightest leading-none", dark ? "text-cream-50" : "text-ink")}>Squadco</span>
      <span className={cn("text-[0.82em] font-medium tracking-tight leading-none", dark ? "text-cream-50/55" : "text-ink/45")}>/ escrow</span>
    </span>
  );
}
