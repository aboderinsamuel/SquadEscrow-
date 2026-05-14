import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { AppHeader } from "@/components/AppHeader";
import { JobCard } from "@/components/JobCard";
import { SectionTitle } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import Link from "next/link";
import { categoryLabel, naira } from "@/lib/utils";

export default async function FeedPage() {
  await seedIfEmpty();
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  const db = readDB();
  const isWorker = me.role !== "customer";

  const openJobs = db.jobs
    .filter((j) => j.state === "POSTED" && j.customer_id !== me.id)
    .sort((a, b) => (a.urgency === "today" ? -1 : 0) - (b.urgency === "today" ? -1 : 0) || b.created_at - a.created_at);

  const myJobs = db.jobs.filter((j) => j.customer_id === me.id).sort((a, b) => b.created_at - a.created_at);

  const topWorkers = db.users
    .filter((u) => u.role === "worker" && u.id !== me.id)
    .sort((a, b) => b.jara_score - a.jara_score)
    .slice(0, 6);

  const customerName = (id: string) => db.users.find((u) => u.id === id)?.name || "Customer";

  return (
    <>
      <AppHeader
        right={
          <Link href="/app/profile" className="flex items-center gap-2">
            <Avatar name={me.name || me.phone} size={32} verified={me.kyc_tier >= 2} />
          </Link>
        }
      />

      {/* Greeting block — bold, mockup-style */}
      <section className="mt-5 mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">{isWorker ? "Today's hustle" : "Near you · Lagos"}</div>
          <h1 className="font-display text-[32px] font-bold tracking-tightest leading-[0.98] mt-1.5">
            {isWorker ? <>Today's<br />jobs.</> : <>Need help<br />today?</>}
          </h1>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55 mt-2">FILTER</span>
      </section>

      {/* Stat row — mockup-aligned */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Stat label="Squadco Score" value={me.jara_score || "—"} tone="cream" />
        <Stat label={isWorker ? "Jobs done" : "Posted"} value={isWorker ? me.jobs_completed : myJobs.length} tone="ink" />
        <Stat label="KYC" value={`Tier ${me.kyc_tier}`} tone={me.kyc_tier >= 2 ? "forest" : "coral"} />
      </div>

      {/* Customer CTA */}
      {!isWorker && (
        <Link href="/app/post" className="block mb-6">
          <div className="rounded-2xl bg-coral-500 text-cream-50 p-5 flex items-center gap-4 shadow-pop">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-cream-50/15 text-2xl font-bold">＋</div>
            <div className="flex-1">
              <div className="font-bold text-[17px] tracking-tight leading-tight">Post a job</div>
              <div className="text-[12.5px] text-cream-50/80 mt-0.5">Funded via Squad escrow · pay only when done</div>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </div>
        </Link>
      )}

      {/* Open jobs */}
      <section className="space-y-2.5">
        {openJobs.length === 0 && (
          <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-6 text-center text-ink/55 text-sm">No open jobs right now. Check back soon.</div>
        )}
        {openJobs.map((j) => <JobCard key={j.id} job={j} customerName={customerName(j.customer_id)} />)}
      </section>

      {/* Customer's own jobs */}
      {myJobs.length > 0 && (
        <section className="mt-8 space-y-2.5">
          <SectionTitle hint={`${myJobs.length}`}>Your jobs</SectionTitle>
          {myJobs.slice(0, 6).map((j) => <JobCard key={j.id} job={j} />)}
        </section>
      )}

      {/* Top workers — for customers */}
      {!isWorker && (
        <section className="mt-10">
          <SectionTitle>Top-rated workers</SectionTitle>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory">
            {topWorkers.map((w) => (
              <Link key={w.id} href={`/app/profile?u=${w.id}`} className="shrink-0 w-52 snap-start rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
                <Avatar name={w.name} size={48} verified={w.kyc_tier >= 2} />
                <div className="mt-3 font-bold tracking-tight truncate">{w.name.split(" ")[0]}</div>
                <div className="text-[11px] text-ink/55 truncate">{w.area || "Lagos"}</div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-forest-500 text-cream-50 px-2 py-0.5 font-semibold">★ {w.avg_rating.toFixed(1)}</span>
                  <span className="rounded-full bg-ink/8 text-ink/70 px-2 py-0.5 font-semibold">{w.jobs_completed} jobs</span>
                </div>
                <div className="mt-2 text-[11px] text-ink/65 line-clamp-2">{(w.skills || []).map((s) => categoryLabel[s] || s).join(", ")}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: any; tone: "cream" | "ink" | "forest" | "coral" }) {
  const cls = tone === "cream" ? "bg-cream-50 text-ink ring-1 ring-ink/10" : tone === "ink" ? "bg-ink text-cream-50" : tone === "forest" ? "bg-forest-500 text-cream-50" : "bg-coral-500 text-cream-50";
  return (
    <div className={"rounded-2xl px-3 py-3 " + cls}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-65">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tightest">{value}</div>
    </div>
  );
}
