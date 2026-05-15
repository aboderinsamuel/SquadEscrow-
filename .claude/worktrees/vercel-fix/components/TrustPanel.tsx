import { naira } from "@/lib/utils";
import type { FraudSignals } from "@/lib/types";

interface Props {
  signals: FraudSignals;
  accountName?: string;
  businessName?: string;
  ninPresent?: boolean;
  bvnPresent?: boolean;
  livenessPassed?: boolean;
  source: "registered" | "discovered" | "claimed";
}

export function TrustPanel({ signals, accountName, businessName, ninPresent, bvnPresent, livenessPassed, source }: Props) {
  const ageDays = signals.account_age_days || 0;
  const socialDays = signals.social_age_days || 0;
  const match = signals.account_name_match_score ?? 0;

  // Aggregate trust score for the headline.
  let score = 0;
  if (ninPresent) score += 20;
  if (bvnPresent) score += 15;
  if (livenessPassed) score += 15;
  if (signals.nin_matches_bvn) score += 10;
  if (match >= 80) score += 15; else if (match >= 60) score += 8;
  if (ageDays >= 365) score += 10; else if (ageDays >= 180) score += 5;
  if (socialDays >= 365) score += 10; else if (socialDays >= 180) score += 5;
  if (signals.geo_state_consistency) score += 5;
  score = Math.min(100, score);

  const band = score >= 80 ? { label: "Strongly verified", tone: "bg-forest-900 text-cream-50", barBg: "bg-forest-500" }
    : score >= 60 ? { label: "Verified", tone: "bg-forest-500 text-cream-50", barBg: "bg-forest-400" }
    : score >= 40 ? { label: "Partial", tone: "bg-gold-400 text-ink", barBg: "bg-gold-500" }
    : { label: "Unclaimed", tone: "bg-coral-500 text-cream-50", barBg: "bg-coral-500" };

  return (
    <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 overflow-hidden">
      <div className={"px-5 py-4 flex items-center justify-between " + band.tone}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] opacity-75">Trust check</div>
          <div className="text-xl font-bold tracking-tight">{band.label}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tracking-tight">{score}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">/100</div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        <Row
          ok={!!ninPresent}
          label="NIN verified"
          detail={ninPresent ? "Matched against NIMC database" : source === "discovered" ? "Unclaimed — invite to verify" : "Not on file"}
        />
        <Row
          ok={!!bvnPresent}
          label="BVN linked"
          detail={bvnPresent ? "Confirmed via NIBSS" : "Optional · raises tier to 3"}
        />
        <Row
          ok={!!livenessPassed}
          label="Selfie + liveness"
          detail={livenessPassed ? "ISO 30107-3 Level 2 passed" : "Not run yet"}
        />
        <Row
          ok={match >= 80}
          warn={match >= 60 && match < 80}
          label="Account-name matches business"
          detail={accountName && businessName ? `“${accountName}” vs “${businessName}” · ${match}% match` : `${match}% fuzzy match`}
        />
        <Row
          ok={!!signals.nin_matches_bvn}
          label="NIN ↔ BVN cross-check"
          detail={signals.nin_matches_bvn ? "Names align" : source === "discovered" ? "—" : "Pending"}
        />
        <Row
          ok={ageDays >= 180}
          warn={ageDays > 0 && ageDays < 180}
          label="Bank account age"
          detail={ageDays > 0 ? `${ageDays} days · opened ${(new Date(Date.now() - ageDays * 86400000)).toLocaleDateString()}` : "Unknown"}
        />
        <Row
          ok={socialDays >= 180}
          warn={socialDays > 0 && socialDays < 180}
          label="Social presence age"
          detail={socialDays > 0 ? `Oldest handle ${Math.round(socialDays/30)} months old` : "No social handles"}
        />
        <Row
          ok={(signals.device_reuse_count || 0) === 0}
          label="No device fingerprint reuse"
          detail={(signals.device_reuse_count || 0) === 0 ? "Single device, single account" : `${signals.device_reuse_count} accounts on same device`}
        />
        <Row
          ok={!!signals.geo_state_consistency}
          label="Geo + NIN state consistent"
          detail={signals.geo_state_consistency ? "IP, NIN, and bank address agree" : "Mismatch detected"}
        />
        <Row
          ok={(signals.squad_tx_count || 0) >= 1}
          warn={(signals.squad_tx_count || 0) === 0 && source === "discovered"}
          label="Squad transaction history"
          detail={(signals.squad_tx_count || 0) > 0 ? `${signals.squad_tx_count} verified payouts on Squad rails` : "No Squadco Escrow jobs yet"}
        />
      </div>

      <div className="px-5 py-3 border-t border-ink/8 text-[11px] text-ink/55 flex items-center justify-between">
        <span>Checked {signals.last_check ? `${Math.max(1, Math.round((Date.now() - signals.last_check) / 86400000))}d ago` : "now"}</span>
        <span className="font-mono">NIN · BVN · Squad · NIBSS</span>
      </div>
    </div>
  );
}

function Row({ ok, warn, label, detail }: { ok: boolean; warn?: boolean; label: string; detail: string }) {
  const state = ok ? "ok" : warn ? "warn" : "off";
  const dot = state === "ok" ? "bg-forest-500 text-cream-50" : state === "warn" ? "bg-gold-400 text-ink" : "bg-coral-500 text-cream-50";
  const icon = state === "ok" ? "✓" : state === "warn" ? "!" : "×";
  return (
    <div className="flex items-start gap-2.5">
      <span className={"shrink-0 grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold " + dot}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink leading-tight">{label}</div>
        <div className="text-[11.5px] text-ink/55 mt-0.5">{detail}</div>
      </div>
    </div>
  );
}
