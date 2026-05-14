"use client";
import { useState } from "react";
import { Button } from "./Button";
import type { Comment } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface Props {
  targetId: string;
  initialComments: Comment[];
  canPost: boolean;
}

const sourceMeta: Record<string, { label: string; tone: string }> = {
  in_app: { label: "Squadco review", tone: "bg-forest-500 text-cream-50" },
  instagram: { label: "Instagram", tone: "bg-coral-500 text-cream-50" },
  google: { label: "Google", tone: "bg-cream-50 text-ink ring-1 ring-ink/15" },
  jiji: { label: "Jiji.ng", tone: "bg-gold-400 text-ink" },
  whatsapp: { label: "WhatsApp", tone: "bg-forest-500 text-cream-50" },
};

export function Reviews({ targetId, initialComments, canPost }: Props) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [posting, setPosting] = useState(false);
  const [likeState, setLikeState] = useState<Record<string, { liked: boolean; n: number }>>(() => {
    const m: Record<string, { liked: boolean; n: number }> = {};
    for (const c of initialComments) m[c.id] = { liked: false, n: c.likes };
    return m;
  });

  async function postReview() {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target_id: targetId, text, stars }) });
      const d = await r.json();
      if (d.ok && d.comment) {
        setComments([d.comment, ...comments]);
        setLikeState((s) => ({ ...s, [d.comment.id]: { liked: false, n: 0 } }));
        setText("");
      }
    } finally { setPosting(false); }
  }

  async function toggleLike(cid: string) {
    setLikeState((s) => {
      const cur = s[cid] || { liked: false, n: 0 };
      return { ...s, [cid]: { liked: !cur.liked, n: cur.n + (cur.liked ? -1 : 1) } };
    });
    await fetch(`/api/reviews/${cid}/like`, { method: "POST" });
  }

  const sorted = [...comments].sort((a, b) => b.created_at - a.created_at);
  const avg = comments.length ? comments.reduce((s, c) => s + (c.stars || 0), 0) / comments.filter(c => c.stars).length : 0;
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: comments.filter((c) => c.stars === star).length }));
  const total = comments.length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink/55">Avg rating</div>
            <div className="text-4xl font-bold tracking-tight text-ink leading-none mt-1">{avg.toFixed(1)}</div>
            <div className="mt-1 text-[11px] text-ink/55">{total} reviews</div>
          </div>
          <div className="flex-1 space-y-1">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-2 text-[11px]">
                <span className="w-3 text-ink/55">{d.star}★</span>
                <div className="flex-1 h-1.5 rounded-full bg-ink/8 overflow-hidden">
                  <div className="h-full bg-gold-400" style={{ width: total ? `${(d.n / total) * 100}%` : 0 }} />
                </div>
                <span className="w-6 text-right text-ink/55">{d.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Post box */}
      {canPost && (
        <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setStars(s)} className={"text-[22px] transition " + (s <= stars ? "text-gold-500" : "text-ink/20")}>★</button>
            ))}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="How was your experience? Be specific — “fixed the kettle's element” beats “good guy”." className="mt-2 w-full rounded-xl bg-cream-100 ring-1 ring-ink/10 p-3 text-[14px] outline-none focus:ring-ink" />
          <Button size="sm" className="mt-3" onClick={postReview} loading={posting} disabled={!text.trim()}>Post review</Button>
        </div>
      )}

      {/* List */}
      <div className="space-y-2.5">
        {sorted.map((c) => {
          const meta = sourceMeta[c.source] || sourceMeta.in_app;
          const ls = likeState[c.id] || { liked: false, n: c.likes };
          return (
            <div key={c.id} className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4 animate-rise">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink text-[13px]">{c.author_name}</span>
                  {c.author_handle && <span className="text-[11px] text-ink/45">{c.author_handle}</span>}
                </div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " + meta.tone}>{meta.label}</span>
              </div>
              {c.stars != null && (
                <div className="text-gold-500 text-sm mb-1">{"★".repeat(c.stars)}<span className="text-ink/15">{"★".repeat(5 - c.stars)}</span></div>
              )}
              <p className="text-[14px] text-ink/80 leading-relaxed">{c.text}</p>
              <div className="mt-3 flex items-center gap-3 text-[12px]">
                <button onClick={() => toggleLike(c.id)} className={"inline-flex items-center gap-1 " + (ls.liked ? "text-coral-500 font-semibold" : "text-ink/55 hover:text-ink")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={ls.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-9.3-9.7C0.9 7 4 3 7.5 3c2 0 3.5 1 4.5 2.5C13 4 14.5 3 16.5 3 20 3 23.1 7 21.3 11.3 19 15.5 12 21 12 21z"/></svg>
                  <span>{ls.n}</span>
                </button>
                <span className="text-ink/40">{timeAgo(c.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
