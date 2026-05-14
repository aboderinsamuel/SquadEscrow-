"use client";
import { useState } from "react";

export function LikeButton({ targetId, initialLiked, initialCount }: { targetId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  async function toggle() {
    const next = !liked;
    setLiked(next); setCount((c) => c + (next ? 1 : -1));
    await fetch("/api/artisans/like", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target_id: targetId, liked: next }) });
  }
  return (
    <button onClick={toggle} className={"h-14 px-5 rounded-full font-semibold transition flex items-center gap-2 ring-1 " + (liked ? "bg-coral-500 text-cream-50 ring-coral-500" : "bg-cream-50 text-ink ring-ink/15 hover:bg-cream-100")}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2"><path d="M12 21s-7-5.5-9.3-9.7C0.9 7 4 3 7.5 3c2 0 3.5 1 4.5 2.5C13 4 14.5 3 16.5 3 20 3 23.1 7 21.3 11.3 19 15.5 12 21 12 21z"/></svg>
      <span>{count}</span>
    </button>
  );
}
