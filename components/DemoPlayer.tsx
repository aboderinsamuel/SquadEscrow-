"use client";

import { useRef, useState } from "react";

// The <video> is rendered from the start with preload="metadata" so the
// browser fetches just enough to display the first frame (~50–500KB) as a
// real preview. Click swaps in native controls and starts playback.
// Avoids needing a separate poster image while keeping the page fast.
export function DemoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function start() {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        src="/demo.mp4"
        preload="metadata"
        playsInline
        controls={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 w-full h-full bg-ink object-cover"
      />

      {!playing && (
        <button
          type="button"
          onClick={start}
          aria-label="Play product walkthrough video"
          className="group absolute inset-0 grid place-items-center cursor-pointer"
        >
          {/* Subtle dark wash so the play button + caption read on any frame */}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-ink/20" />

          {/* Big play button */}
          <span className="relative grid place-items-center">
            <span className="absolute inset-0 rounded-full bg-coral-500/30 animate-ping" style={{ animationDuration: "2s" }} />
            <span className="absolute -inset-4 rounded-full bg-coral-500/15" />
            <span className="relative grid h-20 w-20 md:h-28 md:w-28 place-items-center rounded-full bg-coral-500 text-cream-50 shadow-pop transition-transform group-hover:scale-110">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </span>

          <span className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-cream-50 pointer-events-none">
            <span className="text-left">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-cream-50/65">Product walkthrough</span>
              <span className="block text-lg font-bold mt-0.5 drop-shadow">Sign up · hire · escrow · payout</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-[12px] text-cream-50/75">
              <span className="h-2 w-2 rounded-full bg-coral-400 animate-pulse" />
              <span>Click to play</span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
