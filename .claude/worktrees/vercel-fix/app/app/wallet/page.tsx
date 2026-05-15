import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { ScoreRing } from "@/components/ScoreRing";
import { jaraScore } from "@/lib/score";
import { naira, timeAgo } from "@/lib/utils";

export default async function WalletPage() {
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  const db = readDB();
  const myTx = db.transactions.filter((t) => t.user_id === me.id).sort((a, b) => b.created_at - a.created_at);
  const earned = myTx.filter((t) => t.type === "payout_out" && t.status === "success").reduce((s, t) => s + t.amount, 0);
  const lastPayout = myTx.find((t) => t.type === "payout_out" && t.status === "success");
  const score = jaraScore(me);
  const inEscrow = db.jobs
    .filter((j) => (j.worker_id === me.id || j.customer_id === me.id) && (j.state === "FUNDED" || j.state === "ASSIGNED" || j.state === "IN_PROGRESS" || j.state === "WORKER_COMPLETED"))
    .reduce((s, j) => s + j.amount, 0);

  return (
    <>
      <AppHeader />

      {/* HERO — big checkmark + paid amount, matching mockup 4 */}
      <section className="pt-4 pb-2 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-forest-500 ring-[3px] ring-ink">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FDF8EF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
        </div>
        <h1 className="mt-5 font-display text-[34px] font-bold tracking-tightest leading-[1.05]">
          {earned > 0 ? <><span>{naira(earned)} paid</span><br/><span>to your bank.</span></> : <>{naira(0)} earned<br/>so far.</>}
        </h1>
      </section>

      {/* Receipt card */}
      <div className="mt-6 rounded-2xl bg-cream-100 ring-1 ring-ink/10 p-5">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink/55">Settlement · T+1 · GTBank</div>
        <div className="mt-3 space-y-1.5 text-[14px]">
          <Row k="Total earnings" v={naira(earned)} />
          <Row k="Squadco fees (7%)" v={`− ${naira(Math.round(earned * 0.07 / 0.93))}`} tone="coral" />
          <Row k="Squad transfer" v={`− ₦20`} />
          <Row k="In escrow now" v={naira(inEscrow)} />
        </div>
      </div>

      {/* Squadco Score — dark card, mockup 4 style */}
      <div className="mt-4 rounded-2xl bg-ink-900 text-cream-50 p-5">
        <ScoreRing score={score.score} label={score.bandLabel} delta={earned > 0 ? 12 : 0} />
        <div className="mt-4 text-[12.5px] text-cream-50/70">
          Eligible: <span className="font-bold text-cream-50">{naira(score.loanCeiling)}</span> loan @ <span className="font-bold text-cream-50">{score.loanApr}%/mo</span> · Carbon-style alt-credit
        </div>
      </div>

      {/* Transaction list */}
      <section className="mt-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55 mb-2.5">Transactions · {myTx.length}</div>
        {myTx.length === 0 && (
          <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-6 text-center text-sm text-ink/55">No transactions yet. Earn your first ₦ by completing a job.</div>
        )}
        <div className="space-y-2">
          {myTx.map((t) => (
            <div key={t.id} className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 px-4 py-3 flex items-center gap-3">
              <div className={"grid h-9 w-9 place-items-center rounded-full text-cream-50 font-bold " + (t.type === "payout_out" ? "bg-forest-500" : "bg-ink")}>
                {t.type === "payout_out" ? "↓" : "↑"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold">{t.type === "payout_out" ? "Payout from Squadco" : t.type === "escrow_in" ? "Escrow received" : t.type === "fee" ? "Platform fee" : t.type}</div>
                <div className="text-[11px] text-ink/45 font-mono truncate">{t.squad_ref}</div>
              </div>
              <div className="text-right">
                <div className={"text-[14px] font-bold tracking-tight " + (t.type === "payout_out" ? "text-forest-600" : "")}>{t.type === "payout_out" ? "+" : "−"}{naira(t.amount)}</div>
                <div className="text-[10.5px] text-ink/45">{timeAgo(t.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "coral" }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink/65">{k}</span>
      <span className={"font-semibold " + (tone === "coral" ? "text-coral-600" : "")}>{v}</span>
    </div>
  );
}
