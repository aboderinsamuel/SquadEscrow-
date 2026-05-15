"use client";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { categoryLabel, naira } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATS = ["generator", "plumbing", "electrical", "ac_hvac", "carpentry", "painting", "tiling", "cleaning", "errand", "delivery", "hairstyling", "tailoring", "photography", "data_entry", "graphic_design", "social_media", "transcription", "tutoring", "other"];
const SUGGEST = [3000, 5000, 8000, 12000, 15000, 25000, 50000];

export function PostJobForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("generator");
  const [amount, setAmount] = useState(15000);
  const [area, setArea] = useState("Lekki");
  const [urgency, setUrgency] = useState<"today" | "this_week" | "flexible">("today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post() {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, description, category, amount, area, urgency }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "Could not post job");
      router.push(`/app/jobs/${d.job_id}?fund=1`);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <Input label="Job title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fix 5kVA generator that won't start" maxLength={80} />

      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Category</div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={"text-[13px] font-semibold rounded-full px-3 py-1.5 ring-1 transition " + (category === c ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 text-ink ring-ink/15 hover:bg-ink/5")}>
              {categoryLabel[c]}
            </button>
          ))}
        </div>
      </div>

      <Textarea label="Describe the job" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Pidgin is fine — AI parses it. e.g. 'Gen no dey on, 5kVA Tiger model, abeg come Lekki by 6'" maxLength={500} />

      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Your offer</div>
        <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/15 px-4 py-3 flex items-center gap-2">
          <span className="text-ink text-2xl font-bold">₦</span>
          <input
            type="number"
            min={500}
            value={amount}
            onChange={(e) => setAmount(Math.max(500, parseInt(e.target.value || "0", 10)))}
            className="flex-1 bg-transparent outline-none text-2xl font-bold tracking-tightest"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {SUGGEST.map((a) => (
            <button key={a} type="button" onClick={() => setAmount(a)} className={"text-[12px] font-semibold rounded-full px-2.5 py-1 ring-1 transition " + (amount === a ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 text-ink ring-ink/15 hover:bg-ink/5")}>{naira(a)}</button>
          ))}
        </div>
        <div className="text-[11px] text-ink/50 mt-2">Workers can negotiate. You only pay when satisfied.</div>
      </div>

      <Input label="Area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Lekki, Ikeja, Remote…" />

      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Urgency</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "today", l: "Today" },
            { v: "this_week", l: "This week" },
            { v: "flexible", l: "Flexible" },
          ].map((o) => (
            <button key={o.v} type="button" onClick={() => setUrgency(o.v as any)} className={"rounded-2xl px-3 py-3.5 font-semibold ring-1 transition " + (urgency === o.v ? "bg-coral-500 text-cream-50 ring-coral-500" : "bg-cream-50 text-ink ring-ink/15 hover:bg-ink/5")}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Live breakdown */}
      <div className="rounded-2xl bg-cream-100 ring-1 ring-ink/10 p-4 text-[14px]">
        <Row k="Your offer" v={naira(amount)} />
        <Row k="Squad VA fee (0.25%, capped ₦1,000)" v={`+ ${naira(Math.min(Math.round(amount * 0.0025), 1000))}`} />
        <Row k="Squadco fee (worker pays, 7%)" v={`− ${naira(Math.round(amount * 0.07))}`} muted />
        <div className="mt-2 border-t border-ink/10 pt-2 flex justify-between text-[15px] font-bold"><span>You pay</span><span>{naira(amount + Math.min(Math.round(amount * 0.0025), 1000))}</span></div>
      </div>

      <Button block size="lg" loading={loading} disabled={!title || !description || amount < 500} onClick={post}>Post job & fund escrow →</Button>
      {error && <p className="text-coral-600 text-center text-sm">{error}</p>}
    </div>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-ink/65">{k}</span>
      <span className={"font-semibold " + (muted ? "text-ink/50" : "")}>{v}</span>
    </div>
  );
}
