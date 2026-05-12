"use client";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { categoryLabel, naira, stateColor, stateLabel, timeAgo } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";
import { useRouter } from "next/navigation";

type WorkerSlim = { id: string; name: string; area?: string; bio?: string; skills?: string[]; jara_score: number; avg_rating: number; jobs_completed: number; on_time_rate: number; kyc_tier: number; bank_code?: string; account_number?: string; account_name?: string };
type CustomerSlim = { id: string; name: string; area?: string; avg_rating: number; kyc_tier: number };

interface AppRow {
  id: string;
  job_id: string;
  worker_id: string;
  offer_amount: number;
  message: string;
  status: string;
  created_at: number;
  worker: WorkerSlim;
}

export function JobDetail({ meId, meRole, job: jobIn, customer, worker: workerIn, applications: appsIn, autoFund }: {
  meId: string;
  meRole: string;
  job: Job;
  customer: CustomerSlim | null;
  worker: WorkerSlim | null;
  applications: AppRow[];
  autoFund: boolean;
}) {
  const router = useRouter();
  const [job, setJob] = useState(jobIn);
  const [worker, setWorker] = useState(workerIn);
  const [apps, setApps] = useState(appsIn);
  const [offer, setOffer] = useState<number>(job.amount);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vaInfo, setVaInfo] = useState<{ va: string; ref: string; source: string } | null>(job.escrow_va ? { va: job.escrow_va, ref: job.escrow_ref || "", source: "stored" } : null);

  const isMine = job.customer_id === meId;
  const myApp = apps.find((a) => a.worker_id === meId);

  async function call(path: string, body?: any) {
    setError(null);
    const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json();
    if (!d.ok) { setError(d.error || "Failed"); return null; }
    return d;
  }
  async function refreshAll() {
    const r = await fetch(`/api/jobs/${job.id}`);
    const d = await r.json();
    if (d.ok) { setJob(d.job); setWorker(d.worker); setApps(d.applications); if (d.job.escrow_va) setVaInfo({ va: d.job.escrow_va, ref: d.job.escrow_ref || "", source: "stored" }); }
  }
  async function fundEscrow() {
    setBusy("fund");
    const d = await call("/api/squad/va", { job_id: job.id });
    setBusy(null);
    if (d) { setVaInfo({ va: d.va, ref: d.ref, source: d.source }); await refreshAll(); }
  }
  async function simulatePayment() {
    setBusy("simulate"); await call("/api/squad/simulate", { job_id: job.id }); setBusy(null); await refreshAll();
  }
  async function apply() {
    setBusy("apply");
    const d = await call(`/api/jobs/${job.id}/apply`, { offer_amount: offer, message });
    setBusy(null); if (d) await refreshAll();
  }
  async function accept(appId: string) { setBusy("accept-" + appId); await call(`/api/jobs/${job.id}/accept`, { application_id: appId }); setBusy(null); await refreshAll(); }
  async function markStart() { setBusy("start"); await call(`/api/jobs/${job.id}/state`, { state: "IN_PROGRESS" }); setBusy(null); await refreshAll(); }
  async function workerDone() { setBusy("wdone"); await call(`/api/jobs/${job.id}/state`, { state: "WORKER_COMPLETED" }); setBusy(null); await refreshAll(); }
  async function customerConfirm() { setBusy("payout"); await call(`/api/jobs/${job.id}/release`); setBusy(null); await refreshAll(); }

  useEffect(() => { if (autoFund && isMine && job.state === "POSTED" && !vaInfo) fundEscrow(); /* eslint-disable-next-line */ }, []);

  const platformFee = Math.round(job.amount * 0.07);
  const workerNet = job.amount - platformFee - 20;

  // Step state for the numbered stepper (matches mockup)
  const steps = [
    { label: "Customer paid " + naira(job.amount), done: !!job.funded_at },
    { label: "Worker accepted", done: !!job.assigned_at },
    { label: job.state === "IN_PROGRESS" ? "Work in progress · ETA 4pm" : job.state === "WORKER_COMPLETED" ? "Worker marked done" : "Work starts", done: job.state === "IN_PROGRESS" || job.state === "WORKER_COMPLETED" || job.state === "SETTLED", active: job.state === "IN_PROGRESS" || job.state === "WORKER_COMPLETED" },
    { label: "Both confirm → release", done: job.state === "SETTLED" },
  ];

  return (
    <div className="space-y-5 mt-3">
      {/* Header row */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55">JOB #{job.id.slice(-7).toUpperCase()}</div>
        <h1 className="font-display text-[32px] font-bold tracking-tightest leading-[1.02] mt-1.5">
          {job.state === "FUNDED" || job.state === "ASSIGNED" || job.state === "IN_PROGRESS" || job.state === "WORKER_COMPLETED" ? "Funds locked in escrow."
            : job.state === "SETTLED" ? "Job complete."
            : job.title}
        </h1>
      </div>

      {/* Job summary card */}
      <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">{categoryLabel[job.category]}</div>
            <div className="font-bold tracking-tight text-[16px] mt-0.5 truncate">{job.title}</div>
            <div className="text-[12.5px] text-ink/55 mt-1">📍 {job.area} · {timeAgo(job.created_at)}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tracking-tightest leading-none">{naira(job.amount)}</div>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${stateColor(job.state)}`}>{stateLabel(job.state)}</span>
          </div>
        </div>
        <p className="mt-3 text-[13.5px] text-ink/75 leading-relaxed">{job.description}</p>
      </div>

      {/* ── ESCROW PANEL — mirrors mockup screen 3 exactly ── */}
      {(isMine || job.state !== "POSTED") && (
        <div className="rounded-2xl bg-forest-900 text-cream-50 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">SQUAD VIRTUAL ACCOUNT</div>

          {!vaInfo && isMine && (
            <>
              <p className="text-cream-50/75 text-[14px] mt-3 mb-4">Mint a single-use Virtual Account. Customer transfers via NIP; Squad fires <code className="text-gold-300">charge_successful</code> on receipt.</p>
              <Button block onClick={fundEscrow} loading={busy === "fund"}>Mint escrow VA</Button>
            </>
          )}

          {vaInfo && (
            <>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[42px] font-bold tracking-tightest leading-none">{naira(job.amount)}</span>
                <span className="text-coral-400 text-3xl font-bold">.</span>
              </div>
              <div className="text-[12.5px] text-cream-50/65 mt-1">Acct: {vaInfo.va.slice(0, 4)}*****{vaInfo.va.slice(-2)} · Ref {vaInfo.ref.slice(-8).toUpperCase()}</div>

              {/* Numbered stepper */}
              <div className="mt-6 space-y-3">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={"step-dot " + (s.done ? "done" : s.active ? "active" : "")}>{s.done ? "✓" : i + 1}</span>
                    <span className={"text-[14px] " + (s.done ? "text-cream-50" : s.active ? "font-bold text-cream-50" : "text-cream-50/55")}>{s.label}</span>
                  </div>
                ))}
              </div>

              {job.state === "POSTED" && (
                <Button block variant="ember" className="mt-5" onClick={simulatePayment} loading={busy === "simulate"}>
                  Simulate customer payment (judge demo)
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* "Protected by Squad escrow" pill */}
      {vaInfo && (
        <div className="rounded-full bg-cream-50 ring-1 ring-dashed ring-ink/30 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">
          Protected by Squad escrow
        </div>
      )}

      {/* Customer view: applications */}
      {isMine && job.state !== "SETTLED" && job.state !== "CANCELLED" && (
        <section>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55 mb-2.5">Applicants · {apps.length}</div>
          {apps.length === 0 && <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4 text-sm text-ink/55 text-center">No applications yet. AI is matching workers.</div>}
          <div className="space-y-2.5">
            {apps.map((a) => (
              <div key={a.id} className={"rounded-2xl ring-1 p-4 " + (a.status === "accepted" ? "bg-forest-50 ring-forest-400" : "bg-cream-50 ring-ink/10")}>
                <div className="flex items-start gap-3">
                  <Avatar name={a.worker.name} size={42} verified={a.worker.kyc_tier >= 2} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold tracking-tight">{a.worker.name}</span>
                      <span className="rounded-full bg-forest-500 text-cream-50 px-2 py-0.5 text-[10.5px] font-semibold">★ {a.worker.avg_rating.toFixed(1)}</span>
                      <span className="rounded-full bg-ink text-cream-50 px-2 py-0.5 text-[10.5px] font-semibold">JARA {a.worker.jara_score}</span>
                    </div>
                    <div className="text-[12px] text-ink/55 mt-1">{a.worker.area} · {a.worker.jobs_completed} jobs done</div>
                    {a.message && <p className="mt-2 text-[13.5px] text-ink/75">"{a.message}"</p>}
                    <div className="mt-2 text-[13px]">Offers <b>{naira(a.offer_amount)}</b>{a.offer_amount !== job.amount && <span className="text-ink/55"> (vs {naira(job.amount)} posted)</span>}</div>
                    {a.status === "pending" && job.state === "FUNDED" && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => accept(a.id)} loading={busy === "accept-" + a.id}>Accept</Button>
                        <Button size="sm" variant="ghost">Message</Button>
                      </div>
                    )}
                    {a.status === "accepted" && <div className="mt-2 inline-flex items-center gap-1.5 text-forest-600 text-[12.5px] font-semibold">✓ Accepted</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Worker view: apply */}
      {!isMine && meRole !== "customer" && job.state === "POSTED" && !myApp && (
        <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">One-tap apply</div>
          <div className="rounded-xl bg-cream-100 ring-1 ring-ink/10 px-3 py-2">
            <div className="text-[10.5px] font-semibold text-ink/55 uppercase tracking-wider">Counter-offer (optional)</div>
            <div className="flex gap-2 items-center mt-1">
              <span className="text-ink text-lg font-bold">₦</span>
              <input type="number" value={offer} onChange={(e) => setOffer(parseInt(e.target.value || "0", 10))} className="flex-1 bg-transparent outline-none text-lg font-bold tracking-tight" />
              <span className="text-[11px] text-ink/45">posted: {naira(job.amount)}</span>
            </div>
          </div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Short note (Pidgin OK)" rows={3} className="w-full rounded-2xl bg-cream-100 px-4 py-3 text-[15px] ring-1 ring-inset ring-ink/15 outline-none focus:ring-ink" />
          <Button block size="lg" onClick={apply} loading={busy === "apply"}>Apply now</Button>
          {error && <p className="text-coral-600 text-sm text-center">{error}</p>}
        </div>
      )}

      {!isMine && myApp && (
        <div className="rounded-2xl bg-forest-500 text-cream-50 p-4 text-[13.5px]">
          ✓ You applied {timeAgo(myApp.created_at)} · offered {naira(myApp.offer_amount)}. {myApp.status === "accepted" ? "Customer accepted — see actions below." : "Awaiting review."}
        </div>
      )}

      {/* Live actions for worker / customer */}
      {worker && (job.worker_id === meId || isMine) && job.state !== "POSTED" && job.state !== "SETTLED" && (
        <div className="space-y-2">
          {job.worker_id === meId && job.state === "ASSIGNED" && <Button block size="lg" onClick={markStart} loading={busy === "start"}>Start the job</Button>}
          {job.worker_id === meId && job.state === "IN_PROGRESS" && <Button block size="lg" onClick={workerDone} loading={busy === "wdone"}>Mark done</Button>}
          {isMine && job.state === "WORKER_COMPLETED" && <Button block size="lg" onClick={customerConfirm} loading={busy === "payout"}>Confirm & release {naira(workerNet)} →</Button>}
        </div>
      )}

      {/* Settled receipt */}
      {job.state === "SETTLED" && (
        <div className="rounded-2xl bg-cream-100 ring-1 ring-ink/10 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Settlement · T+1 · GTBank</div>
          <Row k="Job earnings" v={naira(job.amount)} />
          <Row k="JARA fee (7%)" v={`− ${naira(platformFee)}`} tone="coral" />
          <Row k="Squad transfer" v={`− ₦20`} />
          <div className="mt-3 border-t border-ink/10 pt-3 flex justify-between font-bold text-[17px]"><span>Worker received</span><span>{naira(workerNet)}</span></div>
          {job.payout_ref && <div className="text-[10.5px] text-ink/45 mt-3 font-mono break-all">payout ref: {job.payout_ref}</div>}
        </div>
      )}

      {/* Worker preview */}
      {worker && (
        <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55 mb-2">{isMine ? "Working with" : "Customer"}</div>
          <div className="flex items-start gap-3">
            <Avatar name={worker.name} size={48} verified={worker.kyc_tier >= 2} />
            <div className="flex-1">
              <div className="font-bold tracking-tight">{worker.name}</div>
              <div className="text-[12px] text-ink/55">{worker.area} · JARA {worker.jara_score} · ★ {worker.avg_rating.toFixed(1)}</div>
              {worker.bio && <p className="text-[13px] text-ink/75 mt-2">{worker.bio}</p>}
            </div>
          </div>
        </div>
      )}

      {error && <div className="text-coral-600 text-sm text-center">{error}</div>}
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "coral" }) {
  return (
    <div className="flex justify-between py-1 text-[14px]">
      <span className="text-ink/65">{k}</span>
      <span className={tone === "coral" ? "text-coral-600 font-semibold" : "font-semibold"}>{v}</span>
    </div>
  );
}
