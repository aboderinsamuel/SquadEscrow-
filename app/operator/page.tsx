import { readDB } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { naira, stateColor, stateLabel, timeAgo, categoryLabel } from "@/lib/utils";
<<<<<<< HEAD
import { isLive } from "@/lib/squad";

export const dynamic = "force-dynamic";

export default function OperatorConsole() {
  seedIfEmpty();
  const db = readDB();
  const stats = computeStats(db);

=======
import { isLive, walletBalance, merchantId } from "@/lib/squad";
import { getSquadCalls } from "@/lib/squad-log";

export const dynamic = "force-dynamic";

// Endpoints this app integrates with — drives the "Endpoints integrated" grid.
// We mark each one's last status by scanning the recent API call log.
const SQUAD_ENDPOINTS: { path: string; label: string; purpose: string }[] = [
  { path: "/virtual-account/business", label: "Static VA", purpose: "Per-customer escrow account" },
  { path: "/virtual-account/create-dynamic-virtual-account", label: "Dynamic VA", purpose: "Per-job escrow account" },
  { path: "/payout/account/lookup", label: "Account Lookup", purpose: "Verify bank name pre-payout" },
  { path: "/payout/transfer", label: "Payout", purpose: "Disburse to worker" },
  { path: "/transaction/refund", label: "Refund", purpose: "Dispute resolution" },
  { path: "/virtual-account/merchant/transactions", label: "Transactions", purpose: "Reconciliation feed" },
  { path: "/merchant/balance", label: "Wallet Balance", purpose: "Available NGN float" },
  { path: "/sms/send/instant", label: "SMS / VAS", purpose: "Worker payout notice" },
];

export default async function OperatorConsole() {
  await seedIfEmpty();
  const db = readDB();
  const stats = computeStats(db);

  // Live Squad calls — fire in parallel so the page still renders fast if one is slow.
  const [wallet] = await Promise.all([
    walletBalance().catch((e) => ({ ok: false, error: String(e), balance: 0, source: "error" as const })),
  ]);

  const apiCalls = getSquadCalls();
  const endpointStatus = new Map<string, { ok: boolean; status?: number; at: number }>();
  for (const c of apiCalls) {
    if (!endpointStatus.has(c.path)) {
      endpointStatus.set(c.path, { ok: c.ok, status: c.status, at: c.at });
    }
  }

>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
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

<<<<<<< HEAD
=======
        {/* ── SQUAD INTEGRATION PANEL — judge proof ── */}
        <section className="rounded-3xl bg-cream-50 ring-1 ring-ink/10 p-6 md:p-8">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-5">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-coral-500">Squad API · live integration</div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tightest mt-1">8 endpoints wired. Merchant {merchantId}.</h2>
              <p className="text-ink/65 text-[13.5px] mt-1.5">Every call routed through <code className="bg-ink/5 px-1.5 py-0.5 rounded text-[12px]">lib/squad.ts → callSquad()</code>, HMAC-SHA512 verified on the way back.</p>
            </div>
            <div className="rounded-2xl bg-ink text-cream-50 px-4 py-3 min-w-[180px]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-50/55">Live merchant balance</div>
              <div className="mt-1 font-display text-xl font-bold tracking-tightest">
                {wallet.ok ? naira(wallet.balance ?? 0) : <span className="text-coral-400 text-sm">{(wallet as any).error || "Unavailable"}</span>}
              </div>
              <div className="text-[10px] text-cream-50/55 mt-0.5">GET /merchant/balance</div>
            </div>
          </div>

          {/* Endpoint integration grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SQUAD_ENDPOINTS.map((ep) => {
              const s = endpointStatus.get(ep.path);
              const tone = !s ? "idle" : s.ok ? "ok" : "err";
              const dot = tone === "ok" ? "bg-forest-500" : tone === "err" ? "bg-coral-500" : "bg-ink/20";
              const label = tone === "ok" ? `${s!.status} OK` : tone === "err" ? `${s!.status || "ERR"}` : "not called yet";
              return (
                <div key={ep.path} className="rounded-2xl bg-cream-100 ring-1 ring-ink/8 p-3">
                  <div className="flex items-center gap-2">
                    <span className={"h-2 w-2 rounded-full " + dot}></span>
                    <span className="text-[12.5px] font-bold tracking-tight">{ep.label}</span>
                  </div>
                  <div className="font-mono text-[10.5px] text-ink/55 mt-1 truncate">{ep.path}</div>
                  <div className="text-[11px] text-ink/65 mt-1">{ep.purpose}</div>
                  <div className="text-[10px] text-ink/45 mt-1.5">{s ? `${label} · ${timeAgo(s.at)}` : label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Squad API call log */}
        <section>
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-display text-2xl font-bold tracking-tightest">Squad API call log · {apiCalls.length}</h2>
            <span className="text-[11.5px] text-ink/55">In-memory ring buffer · last 100 calls · resets on cold-start</span>
          </div>
          <div className="rounded-2xl ring-1 ring-ink/10 bg-cream-50 overflow-hidden">
            {apiCalls.length === 0 && (
              <div className="p-6 text-ink/55 text-sm">No Squad API calls yet this session. Trigger one by funding a job, releasing payout, or looking up a bank account.</div>
            )}
            {apiCalls.slice(0, 24).map((c) => (
              <div key={c.id} className="border-t border-ink/8 first:border-t-0 px-4 py-2.5 flex items-center gap-3 flex-wrap">
                <span className={"text-[10px] font-semibold rounded-full px-2 py-0.5 uppercase tracking-wider w-12 text-center " + (c.method === "POST" ? "bg-coral-500 text-cream-50" : c.method === "GET" ? "bg-forest-500 text-cream-50" : "bg-gold-400 text-ink")}>{c.method}</span>
                <span className={"text-[10px] font-semibold rounded-full px-2 py-0.5 uppercase tracking-wider " + (c.ok ? "bg-forest-500/15 text-forest-700" : "bg-coral-500/15 text-coral-700")}>{c.status || (c.ok ? "OK" : "ERR")}</span>
                <span className="font-mono text-[11.5px] text-ink/85 flex-1 min-w-0 truncate">{c.path}</span>
                {c.error && <span className="font-mono text-[10.5px] text-coral-600 truncate max-w-[280px]">{c.error}</span>}
                <span className="text-[10.5px] text-ink/45 font-mono tabular-nums">{c.duration_ms}ms</span>
                <span className="text-[11px] text-ink/45">{timeAgo(c.at)}</span>
              </div>
            ))}
          </div>
        </section>

>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
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
<<<<<<< HEAD
        Built for GTCO Squad Hackathon 3.0 · NDPA-ready Day 1
=======
        NDPA-ready · powered by Squad APIs
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
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
