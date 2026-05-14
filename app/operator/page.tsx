import { readDB } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { naira, stateColor, stateLabel, timeAgo, categoryLabel } from "@/lib/utils";
import { isLive } from "@/lib/squad";

export const dynamic = "force-dynamic";

export default function OperatorConsole() {
  seedIfEmpty();
  const db = readDB();
  const stats = computeStats(db);

  return (
    <main className="min-h-[100dvh] page-bg text-ink">
      <header className="border-b border-ink/8 px-6 py-4 flex items-center justify-between bg-cream-200/85 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Logo size={26} />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink/55">Operator console</span>
          <span className={"text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 " + (isLive ? "bg-forest-500 text-cream-50" : "bg-gold-400 text-ink")}>
            {isLive ? "Squad LIVE sandbox" : "Squad MOCK mode"}
          </span>
        </div>
        <Link href="/" className="text-[13px] text-ink/55 hover:text-ink">← Home</Link>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <section>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-coral-500">Live operations</div>
          <h1 className="mt-2 font-display text-[40px] md:text-[56px] font-bold tracking-tightest leading-[0.95]">The state machine, in real time.</h1>
          <p className="mt-3 text-ink/65 max-w-2xl">Every Squad call, every job state transition, every HMAC-verified webhook. This is the view our compliance officer ships to NDPC in 5 minutes.</p>
        </section>

        {/* Stat strip */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Stat label="Users" v={String(stats.users)} tone="white" />
          <Stat label="Workers" v={String(stats.workers)} tone="white" />
          <Stat label="Jobs" v={String(stats.jobs)} tone="white" />
          <Stat label="In escrow" v={naira(stats.in_escrow)} tone="coral" />
          <Stat label="GMV settled" v={naira(stats.gmv)} tone="forest" />
          <Stat label="Webhooks rx" v={String(stats.webhooks)} tone="ink" />
        </section>

        {/* Float yield */}
        <section className="rounded-3xl bg-ink-900 text-cream-50 p-6 md:p-8">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-5">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold-400">Float yield estimator</div>
              <div className="font-display text-2xl font-bold tracking-tightest mt-1">17% T-bill yields on every escrowed naira</div>
            </div>
            <span className="text-[11.5px] text-cream-50/55">based on current escrow holdings</span>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <FloatCard label="Float held now" v={naira(stats.in_escrow)} />
            <FloatCard label="Avg daily (3d hold)" v={naira(Math.round(stats.in_escrow / 3))} />
            <FloatCard label="Yield per day" v={naira(Math.round(stats.in_escrow * 0.17 / 365))} sub="at 17% p.a." />
            <FloatCard label="Annualised" v={naira(Math.round(stats.in_escrow * 0.17))} sub="if held continuously" highlight />
          </div>
        </section>

        {/* Jobs table */}
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tightest mb-3">All jobs · live state machine</h2>
          <div className="rounded-2xl ring-1 ring-ink/10 bg-cream-50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink/55 text-[10.5px] uppercase tracking-[0.14em] font-semibold">
                <tr>
                  <th className="text-left p-3 font-semibold">Job</th>
                  <th className="text-left p-3 font-semibold">Amount</th>
                  <th className="text-left p-3 font-semibold">State</th>
                  <th className="text-left p-3 font-semibold">VA / Ref</th>
                  <th className="text-left p-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {db.jobs.slice().sort((a, b) => b.created_at - a.created_at).map((j) => (
                  <tr key={j.id} className="border-t border-ink/8 hover:bg-cream-100/50">
                    <td className="p-3">
                      <Link href={`/app/jobs/${j.id}`} className="hover:text-coral-600">
                        <div className="font-semibold tracking-tight">{j.title}</div>
                        <div className="text-[11px] text-ink/50">{categoryLabel[j.category]} · {j.area}</div>
                      </Link>
                    </td>
                    <td className="p-3 font-bold">{naira(j.amount)}</td>
                    <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${stateColor(j.state)}`}>{stateLabel(j.state)}</span></td>
                    <td className="p-3 font-mono text-[11px] text-ink/55">{j.escrow_va || "—"}</td>
                    <td className="p-3 text-ink/55 text-[12px]">{timeAgo(j.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Webhooks */}
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tightest mb-3">Squad webhooks · HMAC-verified</h2>
          <div className="rounded-2xl ring-1 ring-ink/10 bg-cream-50 overflow-hidden">
            {db.webhooks.length === 0 && <div className="p-6 text-ink/55 text-sm">No webhooks yet. Trigger one by funding a job → Simulate payment.</div>}
            {db.webhooks.slice().sort((a, b) => b.processed_at - a.processed_at).slice(0, 12).map((w) => (
              <div key={w.id} className="border-t border-ink/8 first:border-t-0 px-4 py-3 flex items-center gap-3 flex-wrap">
                <span className={"text-[10px] font-semibold rounded-full px-2 py-0.5 uppercase tracking-wider " + (w.verified ? "bg-forest-500 text-cream-50" : "bg-coral-500 text-cream-50")}>{w.verified ? "verified" : "bad sig"}</span>
                <span className="font-mono text-[12px] font-bold">{w.event_type}</span>
                <span className="font-mono text-[10px] text-ink/40 truncate flex-1 min-w-0">{w.signature.slice(0, 36)}…</span>
                <span className="text-[11px] text-ink/45">{timeAgo(w.processed_at)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Workers */}
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tightest mb-3">Verified workers · Squadco Score</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {db.users.filter((u) => u.role === "worker").map((u) => (
              <div key={u.id} className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-bold tracking-tight">{u.name}</div>
                  <span className="rounded-full bg-ink text-cream-50 px-2 py-0.5 text-[10.5px] font-semibold">Score {u.jara_score || 0}</span>
                </div>
                <div className="text-[12px] text-ink/55 mt-1">{u.area} · KYC tier {u.kyc_tier}</div>
                <div className="mt-2 text-[12px] text-ink/70">{u.jobs_completed} jobs · ★ {u.avg_rating.toFixed(1)} · {Math.round(u.on_time_rate * 100)}% on-time</div>
                <div className="text-[11px] text-ink/45 mt-1 line-clamp-2">{(u.skills || []).map((s) => categoryLabel[s] || s).join(", ")}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="py-10 text-center text-[12px] text-ink/45">
        NDPA-ready · powered by Squad APIs
      </footer>
    </main>
  );
}

function computeStats(db: ReturnType<typeof readDB>) {
  const workers = db.users.filter((u) => u.role === "worker").length;
  const in_escrow = db.jobs.filter((j) => j.state === "FUNDED" || j.state === "ASSIGNED" || j.state === "IN_PROGRESS" || j.state === "WORKER_COMPLETED").reduce((s, j) => s + j.amount, 0);
  const gmv = db.jobs.filter((j) => j.state === "SETTLED").reduce((s, j) => s + j.amount, 0);
  return { users: db.users.length, workers, jobs: db.jobs.length, in_escrow, gmv, webhooks: db.webhooks.length };
}

function Stat({ label, v, tone }: { label: string; v: string; tone: "white" | "ink" | "forest" | "coral" | "gold" }) {
  const cls = tone === "white" ? "bg-cream-50 text-ink ring-1 ring-ink/10" : tone === "ink" ? "bg-ink text-cream-50" : tone === "forest" ? "bg-forest-500 text-cream-50" : tone === "coral" ? "bg-coral-500 text-cream-50" : "bg-gold-400 text-ink";
  return (
    <div className={"rounded-2xl px-4 py-4 " + cls}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-65">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tightest">{v}</div>
    </div>
  );
}

function FloatCard({ label, v, sub, highlight }: { label: string; v: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={"rounded-2xl p-4 " + (highlight ? "bg-gold-400 text-ink" : "bg-cream-50/8 ring-1 ring-cream-50/15 text-cream-50")}>
      <div className={"text-[10px] font-semibold uppercase tracking-[0.14em] " + (highlight ? "text-ink/65" : "text-cream-50/55")}>{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tightest">{v}</div>
      {sub && <div className={"text-[11px] " + (highlight ? "text-ink/65" : "text-cream-50/55")}>{sub}</div>}
    </div>
  );
}
