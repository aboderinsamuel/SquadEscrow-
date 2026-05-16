"use client";

import { useState } from "react";

// Click-to-play wrapper around /public/demo.mp4. The styled poster is rendered
// until the user clicks; only then does the 59MB asset start downloading. After
// click, autoPlay + (unmuted) audio works because the click counts as a user
// gesture under autoplay policy.
export function DemoPlayer() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <video
        src="/demo.mp4"
        controls
        autoPlay
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full bg-ink object-contain"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label="Play product walkthrough video"
      className="group absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-900 via-forest-900 to-ink overflow-hidden cursor-pointer"
    >
      {/* Animated background dots */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(rgba(180,255,57,0.18) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />
      <span aria-hidden className="absolute inset-x-0 -top-1/2 h-full bg-gradient-radial from-coral-500/30 via-transparent to-transparent blur-3xl" />

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
          <span className="block text-[10px] uppercase tracking-[0.18em] text-cream-50/55">Product walkthrough</span>
          <span className="block text-lg font-bold mt-0.5">Sign up · hire · escrow · payout</span>
        </span>
        <span className="hidden md:flex items-center gap-1.5 text-[12px] text-cream-50/65">
          <span className="h-2 w-2 rounded-full bg-coral-400" />
          <span>Click to play</span>
        </span>
      </span>
    </button>
  );
}
