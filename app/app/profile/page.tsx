import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { ScoreDial } from "@/components/ScoreRing";
import { categoryLabel } from "@/lib/utils";
import { jaraScore } from "@/lib/score";
import { LogoutButton } from "./LogoutButton";

export default function ProfilePage({ searchParams }: { searchParams: { u?: string } }) {
  const me = getSessionUser();
  if (!me) redirect("/auth");
  const db = readDB();
  const u = searchParams.u ? db.users.find((x) => x.id === searchParams.u) : me;
  if (!u) redirect("/app/feed");
  const self = u.id === me.id;
  const score = jaraScore(u);

  return (
    <>
      <AppHeader title={self ? "Your profile" : u.name} back={!self} right={self ? <LogoutButton /> : undefined} />

      <section className="mt-5 mb-5">
        <div className="flex items-start gap-4">
          <Avatar name={u.name || u.phone} size={72} verified={u.kyc_tier >= 2} />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[28px] font-bold tracking-tightest leading-tight truncate">{u.name || "Anonymous"}</h1>
            <div className="text-[13px] text-ink/55 mt-1">{u.area || "—"} · {u.phone}</div>
            <div className="mt-2.5 flex gap-1.5 flex-wrap">
              {u.kyc_tier >= 1 && <Badge tone="forest">NIN ✓</Badge>}
              {u.kyc_tier >= 2 && <Badge tone="forest">Liveness ✓</Badge>}
              {u.kyc_tier >= 3 && <Badge tone="forest">BVN linked</Badge>}
              <Badge tone="neutral">Joined {new Date(u.created_at).toLocaleDateString()}</Badge>
            </div>
          </div>
        </div>
        {u.bio && <p className="mt-4 text-[14px] text-ink/75 leading-relaxed">{u.bio}</p>}
      </section>

      {/* Score block */}
      <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-5">
        <div className="flex items-center gap-5">
          <ScoreDial score={score.score} label={score.bandLabel} />
          <div className="flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink/55">Credit · GT MFB</div>
            <div className="mt-1 text-[22px] font-bold tracking-tightest">₦{score.loanCeiling.toLocaleString()}</div>
            <div className="text-[12px] text-ink/55">at {score.loanApr}%/mo</div>
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
              <Mini label="Jobs" v={String(u.jobs_completed)} />
              <Mini label="On-time" v={`${Math.round(u.on_time_rate * 100)}%`} />
              <Mini label="Rating" v={`★ ${u.avg_rating.toFixed(1)}`} />
            </div>
          </div>
        </div>
      </div>

      {u.skills && u.skills.length > 0 && (
        <section className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55 mb-2">Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {u.skills.map((s) => (
              <span key={s} className="rounded-full bg-cream-50 ring-1 ring-ink/12 px-3 py-1.5 text-[13px] font-semibold">{categoryLabel[s] || s}</span>
            ))}
          </div>
        </section>
      )}

      {self && (
        <section className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55 mb-2">Payout bank</div>
          <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
            {u.account_number ? (
              <>
                <div className="font-bold tracking-tight">{u.account_name}</div>
                <div className="font-mono text-[13px] text-ink/65 mt-0.5">{u.account_number} · {u.bank_code === "058" ? "GTBank (instant ⚡)" : `Bank ${u.bank_code}`}</div>
                <div className="mt-2 text-[12px] text-ink/55">{u.bank_code === "058" ? "Instant settlement" : "T+1 next business day"}</div>
              </>
            ) : (
              <div className="text-sm text-ink/55">No payout bank linked. Complete KYC to unlock.</div>
            )}
          </div>
        </section>
      )}

      <section className="mt-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55 mb-2">Trust & Traction</div>
        <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4 grid grid-cols-2 gap-2.5">
          <Trust label="KYC" pass={u.kyc_tier >= 2} hint={`Tier ${u.kyc_tier}`} />
          <Trust label="Liveness" pass={!!u.liveness_passed} hint={u.liveness_passed ? "ISO 30107-3" : "Not run"} />
          <Trust label="Disputes" pass={(u.disputes || 0) === 0} hint={String(u.disputes || 0)} />
          <Trust label="On-time" pass={u.on_time_rate >= 0.85} hint={`${Math.round(u.on_time_rate * 100)}%`} />
        </div>
      </section>
    </>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-lg bg-cream-100 ring-1 ring-ink/10 px-2 py-2 text-center">
      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-ink/55">{label}</div>
      <div className="font-bold mt-0.5">{v}</div>
    </div>
  );
}

function Trust({ label, pass, hint }: { label: string; pass: boolean; hint?: string }) {
  return (
    <div className="rounded-xl bg-cream-100 ring-1 ring-ink/10 p-3 flex items-center gap-2">
      <span className={"step-dot " + (pass ? "done" : "")}>{pass ? "✓" : "—"}</span>
      <div className="flex-1">
        <div className="text-[13px] font-semibold">{label}</div>
        {hint && <div className="text-[10.5px] text-ink/55">{hint}</div>}
      </div>
    </div>
  );
}
