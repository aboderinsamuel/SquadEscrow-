"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { categoryLabel, naira } from "@/lib/utils";

interface ReelArtisan {
  id: string;
  business_name: string;
  category: string;
  area: string;
  avg_rating: number;
  jobs_completed: number;
  credibility: number;
  followers: number;
  hourly_rate: number | null;
  photos: string[];
  bio?: string;
  source: "registered" | "discovered" | "claimed";
  claimed: boolean;
}

// Local mp4s served from /public/reels by Vercel's edge CDN. Same-origin =
// no extra DNS/TLS hop, HTTP range requests work out of the box, first frame
// typically renders in <100ms. See public/reels/README.md for encoding tips.
const DEMO_VIDEOS = [
  "/reels/1.mp4",
  "/reels/2.mp4",
  "/reels/3.mp4",
  "/reels/4.mp4",
];

const CAPTIONS = [
  "Same-day callouts. ⚡",
  "Honest pricing, tools-on-site.",
  "5-star home service · Lagos-wide.",
  "Book in 2 taps. Pay via escrow.",
];

export function DiscoverReels({ artisans }: { artisans: ReelArtisan[] }) {
  // Pick a curated batch of 4 (highest credibility, varied categories).
  const featured = useMemo(() => {
    const byCat = new Map<string, ReelArtisan>();
    for (const a of [...artisans].sort((a, b) => b.credibility - a.credibility)) {
      if (!byCat.has(a.category)) byCat.set(a.category, a);
      if (byCat.size >= 4) break;
    }
    const arr = Array.from(byCat.values()).slice(0, 4);
    // Pad with top artisans if we didn't get 4 unique categories
    if (arr.length < 4) {
      for (const a of [...artisans].sort((a, b) => b.credibility - a.credibility)) {
        if (!arr.includes(a)) arr.push(a);
        if (arr.length >= 4) break;
      }
    }
    return arr;
  }, [artisans]);

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="-mx-5 mt-1 mb-5">
      <div className="px-5 mb-2.5 flex items-center justify-between">
        <h2 className="font-display text-[20px] font-bold tracking-tightest">Reels</h2>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink/55">Featured · 4</span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-none">
        {featured.map((a, i) => (
          <ReelCard
            key={a.id}
            artisan={a}
            videoUrl={DEMO_VIDEOS[i % DEMO_VIDEOS.length]}
            caption={CAPTIONS[i % CAPTIONS.length]}
            onTap={() => setOpen(i)}
          />
        ))}
      </div>

      {open !== null && (
        <ReelsViewer
          reels={featured.map((a, i) => ({
            artisan: a,
            videoUrl: DEMO_VIDEOS[i % DEMO_VIDEOS.length],
            caption: CAPTIONS[i % CAPTIONS.length],
          }))}
          startIndex={open}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

function ReelCard({ artisan, videoUrl, caption, onTap }: { artisan: ReelArtisan; videoUrl: string; caption: string; onTap: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = ref.current;
        if (!v) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          setInView(true);
          v.play().catch(() => {});
        } else {
          setInView(false);
          v.pause();
        }
      },
      { threshold: [0, 0.4, 0.8] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const top = artisan.credibility >= 85;
  const isReg = artisan.source === "registered" || artisan.claimed;

  return (
    <button
      ref={containerRef}
      onClick={onTap}
      className="shrink-0 snap-start relative w-[180px] aspect-[9/16] rounded-2xl overflow-hidden bg-ink ring-1 ring-ink/12 shadow-card text-left"
    >
      <video
        ref={ref}
        src={videoUrl}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        poster=""
      />
      {/* Gradient overlay top + bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Top-left badges */}
      <div className="absolute top-2 left-2 right-2 flex items-center gap-1 flex-wrap">
        {top && <Badge tone="gold">★ Top</Badge>}
        {isReg ? <Badge tone="forest">Verified</Badge> : <Badge tone="outline">Scraped</Badge>}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 inset-x-0 p-2.5 text-cream-50">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">{categoryLabel[artisan.category] || artisan.category}</div>
        <div className="font-bold text-[13.5px] leading-tight tracking-tight line-clamp-1 mt-0.5">{artisan.business_name}</div>
        <div className="text-[10.5px] opacity-80 mt-0.5 line-clamp-1">★ {artisan.avg_rating.toFixed(1)} · {artisan.area}</div>
        <div className="text-[10.5px] opacity-75 line-clamp-1 mt-0.5">{caption}</div>
      </div>

      {/* Play indicator if not in view */}
      {!inView && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="grid place-items-center h-10 w-10 rounded-full bg-cream-50/85 text-ink shadow-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}
    </button>
  );
}

function ReelsViewer({ reels, startIndex, onClose }: { reels: { artisan: ReelArtisan; videoUrl: string; caption: string }[]; startIndex: number; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(startIndex);
  // Start muted — autoplay policies on iOS Safari + Chrome Android require it.
  // The toggle below is a user gesture, which permits unmuting from then on.
  const [muted, setMuted] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = scrollRef.current;
    if (!el) return;
    // Scroll to start index (vertical scroll snap)
    el.scrollTo({ top: el.clientHeight * startIndex, behavior: "auto" });
  }, [mounted, startIndex]);

  useEffect(() => {
    if (!mounted) return;
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const i = Math.round(el.scrollTop / el.clientHeight);
      setActive(i);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [mounted]);

  useEffect(() => {
    // Play active video, pause others
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active]);

  // Keep the <video>.muted property in sync with the toggle. We bind it
  // imperatively (not via the muted attribute) because changing the attribute
  // after mount doesn't reliably propagate in some browsers.
  useEffect(() => {
    videoRefs.current.forEach((v) => { if (v) v.muted = muted; });
  }, [muted]);

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      // If we're unmuting, kick the active video to play() inside the same
      // synchronous user-gesture callback so Safari doesn't reject it.
      if (!next) {
        const v = videoRefs.current[active];
        if (v) { v.muted = false; v.play().catch(() => {}); }
      }
      return next;
    });
  }

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black">
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto snap-y snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {reels.map((r, i) => {
          // Preload the active video and the next one (modulo length so it
          // also wraps 4 → 1) so scroll-to-next has the first chunk already.
          // Other slots stay on metadata-only to keep memory pressure down.
          const isActiveOrNext = i === active || i === (active + 1) % reels.length;
          return (
          <div key={i} className="relative h-screen w-full snap-start snap-always">
            <video
              ref={(el) => { videoRefs.current[i] = el; if (el) el.muted = muted; }}
              src={r.videoUrl}
              loop
              playsInline
              preload={isActiveOrNext ? "auto" : "metadata"}
              className="absolute inset-0 w-full h-full object-cover"
              onClick={(e) => {
                const v = e.currentTarget;
                if (v.paused) v.play().catch(() => {}); else v.pause();
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85 pointer-events-none" />

            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 z-10 px-4 pt-[max(env(safe-area-inset-top),16px)] pb-3 flex items-center justify-between">
              <button onClick={onClose} aria-label="Close reels" className="grid h-10 w-10 place-items-center rounded-full bg-cream-50/15 backdrop-blur text-cream-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
              <div className="text-cream-50/85 text-[12px] font-semibold tracking-wide uppercase">{i + 1} / {reels.length}</div>
              <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="grid h-10 w-10 place-items-center rounded-full bg-cream-50/15 backdrop-blur text-cream-50">
                {muted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>
                )}
              </button>
            </div>

            {/* First-open hint: nudge the user to unmute. Shows only while
                muted, on the active reel. Disappears as soon as they tap. */}
            {muted && i === active && (
              <button
                onClick={toggleMute}
                aria-label="Tap to unmute"
                className="absolute z-10 top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-cream-50/20 backdrop-blur text-cream-50 text-[12px] font-semibold tracking-wide flex items-center gap-2 ring-1 ring-cream-50/25 animate-pulse"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>
                Tap to unmute
              </button>
            )}

            {/* Right rail actions */}
            <div className="absolute right-3 bottom-[180px] z-10 flex flex-col gap-4 text-cream-50">
              <RailAction icon="heart" label={String(Math.max(120, Math.round(r.artisan.followers / 90)))} />
              <RailAction icon="comment" label={String(Math.max(8, Math.round(r.artisan.jobs_completed / 12)))} />
              <RailAction icon="share" label="Share" />
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 inset-x-0 z-10 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-6 text-cream-50">
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                {r.artisan.credibility >= 85 && <Badge tone="gold">★ Top</Badge>}
                {(r.artisan.source === "registered" || r.artisan.claimed) ? <Badge tone="forest">Verified</Badge> : <Badge tone="outline">Scraped</Badge>}
                <span className="text-[11px] text-cream-50/80">{categoryLabel[r.artisan.category] || r.artisan.category} · {r.artisan.area}</span>
              </div>
              <h3 className="font-display text-[24px] font-bold tracking-tightest leading-tight">{r.artisan.business_name}</h3>
              <p className="text-[13px] text-cream-50/85 mt-1 line-clamp-2">{r.artisan.bio || r.caption}</p>
              <div className="mt-2 flex items-center gap-3 text-[12px] text-cream-50/85">
                <span>★ {r.artisan.avg_rating.toFixed(1)}</span>
                <span>· {r.artisan.jobs_completed} jobs</span>
                {r.artisan.hourly_rate && <span>· {naira(r.artisan.hourly_rate)}/hr</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link href={`/app/artisans/${r.artisan.id}`} className="flex-1">
                  <Button block size="md" variant="outline" className="text-cream-50 ring-cream-50/60 hover:bg-cream-50/10">View profile</Button>
                </Link>
                <Link href={`/app/post?to=${r.artisan.id}`} className="flex-1">
                  <Button block size="md">Book now</Button>
                </Link>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}

function RailAction({ icon, label }: { icon: "heart" | "comment" | "share"; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-cream-50/15 backdrop-blur">
        {icon === "heart" && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        )}
        {icon === "comment" && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {icon === "share" && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
        )}
      </span>
      <span className="text-[10.5px] font-semibold">{label}</span>
    </button>
  );
}
