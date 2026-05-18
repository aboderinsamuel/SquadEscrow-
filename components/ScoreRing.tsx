export function ScoreRing({ score, label, delta }: { score: number; label?: string; delta?: number }) {
  // Linear gradient bar — coral (low) to gold (mid) to forest (high)
  const pct = Math.max(0, Math.min(1, (score - 300) / (850 - 300)));
  return (
    <div className="w-full">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-400">Squadco Score</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tightest text-cream-50">{score}</span>
            {typeof delta === "number" && delta !== 0 && (
              <span className={"text-base font-semibold " + (delta >= 0 ? "text-forest-300" : "text-coral-400")}>
                {delta >= 0 ? "+" : ""}{delta}
              </span>
            )}
          </div>
        </div>
        {label && <span className="text-[11px] uppercase tracking-wider text-cream-50/55">{label}</span>}
      </div>
      <div className="mt-4 h-2 rounded-full bg-cream-50/15 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round(pct * 100)}%`,
            background: "linear-gradient(90deg, #00C24C 0%, #FFCC00 50%, #1FAE6B 100%)",
          }}
        />
      </div>
    </div>
  );
}

// Compact circular variant for places that still want a ring.
export function ScoreDial({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const pct = Math.max(0, Math.min(1, (score - 300) / (850 - 300)));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`dial-${score}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00C24C" />
            <stop offset="0.5" stopColor="#FFCC00" />
            <stop offset="1" stopColor="#1FAE6B" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(10,10,10,0.10)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#dial-${score})`} strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">Squadco</div>
          <div className="text-3xl font-bold tracking-tightest text-ink">{score}</div>
          {label && <div className="text-[11px] text-ink/55">{label}</div>}
        </div>
      </div>
    </div>
  );
}
