"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/Input";
import { SocialChip } from "@/components/SocialChip";
import { BitmojiAvatar } from "@/components/BitmojiAvatar";
import { categoryLabel, naira } from "@/lib/utils";

interface A {
  id: string;
  name: string;
  area: string;
  category: string;
  avg_rating: number;
  jobs_completed: number;
  credibility: number;
  source: "registered" | "discovered" | "claimed";
  claimed: boolean;
  followers: number;
  hourly_rate: number | null;
  photos: string[];
  bio: string;
  socials: { platform: string; handle: string; verified: boolean }[];
}

export function DiscoverGrid({ all }: { all: A[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"credibility" | "rating" | "jobs">("credibility");

  const cats = useMemo(() => Array.from(new Set(all.map((a) => a.category))), [all]);

  const filtered = useMemo(() => {
    let list = all.slice();
    if (q.trim()) {
      const Q = q.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(Q) || a.bio.toLowerCase().includes(Q) || a.area.toLowerCase().includes(Q) || a.socials.some(s => s.handle.toLowerCase().includes(Q)));
    }
    if (cat !== "all") list = list.filter((a) => a.category === cat);
    list.sort((a, b) => {
      if (sort === "credibility") return b.credibility - a.credibility;
      if (sort === "rating") return b.avg_rating - a.avg_rating;
      return b.jobs_completed - a.jobs_completed;
    });
    return list;
  }, [all, q, cat, sort]);

  return (
    <>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, area, IG handle..." />

      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto -mx-5 px-5 pb-1">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{categoryLabel[c] || c}</Chip>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-[11px] uppercase tracking-wider text-ink/45 font-semibold">Sort:</span>
        {(["credibility", "rating", "jobs"] as const).map((s) => (
          <button key={s} onClick={() => setSort(s)} className={"text-[12px] rounded-full px-2.5 py-1 ring-1 transition " + (sort === s ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 text-ink/65 ring-ink/10")}>
            {s === "credibility" ? "Credibility" : s === "rating" ? "★ Rating" : "Most jobs"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {filtered.map((a) => (
          <Link key={a.id} href={`/app/artisans/${a.id}`} className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-3 hover:-translate-y-1 hover:shadow-card transition-all duration-200 animate-rise">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-cream-200 to-cream-300 ring-1 ring-ink/8 grid place-items-center mb-3 relative overflow-hidden">
              <BitmojiAvatar seed={a.id} size={104} />
              {a.photos[0] && (
                <span className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-xl bg-cream-50 ring-1 ring-ink/10 text-xl shadow-card">{a.photos[0]}</span>
              )}
              {a.credibility >= 85 && <span className="absolute top-2 right-2"><Badge tone="gold">★ Top</Badge></span>}
              {a.source === "discovered" && !a.claimed && <span className="absolute top-2 left-2"><Badge tone="outline">Scraped</Badge></span>}
              {(a.source === "registered" || a.claimed) && <span className="absolute top-2 left-2"><Badge tone="forest">Verified</Badge></span>}
            </div>
            <div className="font-bold text-[14px] tracking-tight leading-tight text-ink line-clamp-1">{a.name}</div>
            <div className="text-[11px] text-ink/55 mt-0.5">{categoryLabel[a.category] || a.category} · {a.area}</div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-ink/70 font-semibold">★ {a.avg_rating.toFixed(1)}</span>
              <span className="text-ink/55">{a.jobs_completed} jobs</span>
            </div>
            {a.socials.length > 0 && (
              <div className="mt-2 flex items-center gap-1 overflow-hidden">
                <SocialChip platform={a.socials[0].platform as any} handle={a.socials[0].handle} verified={a.socials[0].verified} compact />
              </div>
            )}
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="mt-12 text-center text-ink/55 text-sm">No artisans match. Try a different search.</div>
      )}
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={"shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1 transition " + (active ? "bg-coral-500 text-cream-50 ring-coral-500" : "bg-cream-50 text-ink/70 ring-ink/10")}>{children}</button>
  );
}
