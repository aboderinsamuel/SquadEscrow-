import Link from "next/link";
import { Fragment } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { bitmojiUrl } from "@/components/BitmojiAvatar";

export default function Landing() {
  return (
    <main className="relative overflow-hidden text-ink">
      <ScrollReveal />
      {/* Top navigation */}
      <div className="relative mx-auto max-w-6xl px-5">
        <header className="flex items-center justify-between pt-6">
          <Logo size={30} />
          <nav className="hidden md:flex items-center gap-7 text-sm text-ink/65">
            <a href="#discover" className="hover:text-ink transition-colors">Discovery</a>
            <a href="#watch" className="hover:text-ink transition-colors">Watch</a>
            <a href="#how" className="hover:text-ink transition-colors">How it works</a>
            <a href="#trust" className="hover:text-ink transition-colors">Trust</a>
            <a href="#squad" className="hover:text-ink transition-colors">Squad inside</a>
            <Link href="/operator" className="hover:text-ink transition-colors">Operator</Link>
          </nav>
          <Link href="/auth"><Button size="sm">Open app</Button></Link>
        </header>

        {/* HERO — tells the story in 3 seconds */}
        <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center pt-12 lg:pt-20 pb-20">
          <div>
            <div className="hero-rise inline-flex items-center gap-2 rounded-full bg-ink/8 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-coral-500 dot" />
              <span>Now in beta · Lagos</span>
            </div>

            <h1 className="hero-rise hero-rise-delay-1 mt-6 font-display text-[44px] sm:text-[56px] lg:text-[80px] font-bold leading-[0.92] tracking-tightest text-ink">
              Hire Nigeria's <span className="italic text-coral-500">hustle.</span>
              <br />
              Pay only when <span className="underline decoration-gold-400 decoration-[6px] underline-offset-[10px]">it's done.</span>
            </h1>

            <p className="hero-rise hero-rise-delay-2 mt-7 max-w-xl text-ink/70 text-[17px] leading-relaxed">
              The discovery + escrow-protected job marketplace for the <b className="text-ink">92% of Nigerians</b> who work informally. 25,000+ artisans already pinned on the map. NIN-verified. Funds locked in a Squad Virtual Account. T+1 to bank, every time.
            </p>

            <div className="hero-rise hero-rise-delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link href="/auth?role=customer"><Button size="lg">Post a job →</Button></Link>
              <Link href="/auth?role=worker"><Button size="lg" variant="outline">Get hired today</Button></Link>
            </div>

            {/* Trust strip */}
            <div className="hero-rise hero-rise-delay-4 mt-10 flex items-center gap-5 flex-wrap text-[12px] text-ink/55">
              <span className="font-semibold uppercase tracking-[0.15em] text-ink/40">Powered by</span>
              <BrandPill label="Squad" />
              <BrandPill label="HabariPay" />
              <BrandPill label="GTBank" />
              <BrandPill label="Smile ID" />
              <BrandPill label="NIBSS" />
            </div>
          </div>

          {/* PHONE MOCK with Snap-style avatars floating around */}
          <div className="relative lg:justify-self-end hero-rise hero-rise-delay-2">
            <div className="absolute -inset-12 bg-gold-grad opacity-30 blur-3xl rounded-full" aria-hidden />
            {/* Floating avatars circling the phone */}
            <FloatingAvatars />
            <PhoneMock />
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="-mt-6 mb-20 reveal">
          <div className="grid grid-cols-2 md:grid-cols-4 rounded-3xl bg-ink text-cream-50 ring-1 ring-ink/10 overflow-hidden">
            {[
              { v: "92.3%", t: "of NG workers are informal" },
              { v: "127m", t: "Nigerians on NIN (Dec 2025)" },
              { v: "₦70k", t: "monthly minimum wage" },
              { v: "25k+", t: "artisans pre-mapped" },
            ].map((x, i) => (
              <div key={i} className={"px-5 py-6 sm:px-7 sm:py-8 " + (i > 0 ? "md:border-l border-cream-50/10" : "") + (i > 0 && i < 2 ? " border-l border-cream-50/10" : "")}>
                <div className="text-[40px] sm:text-[52px] font-bold tracking-tightest leading-none text-cream-50">{x.v}</div>
                <div className="mt-2 text-[12px] uppercase tracking-[0.14em] text-cream-50/60">{x.t}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DEMO VIDEO */}
        <section id="watch" className="mb-20 reveal">
          <div className="text-center mb-6">
            <SectionLabel>Watch · 90 seconds</SectionLabel>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tightest">See it in motion.</h2>
          </div>
          <div className="relative rounded-[28px] bg-ink ring-1 ring-ink/15 overflow-hidden shadow-card group">
            {/* Aspect-ratio 16/9 video container */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {/*
                ┌─────────────────────────────────────────────────────────────┐
                │ DROP YOUR DEMO VIDEO HERE                                   │
                │                                                             │
                │ Replace the <div> below with one of:                       │
                │                                                             │
                │ 1. <video src="/demo.mp4" controls autoPlay muted loop ... />│
                │ 2. <iframe src="https://www.youtube.com/embed/VIDEO_ID" ... />│
                │ 3. <iframe src="https://player.vimeo.com/video/ID" ... />  │
                │                                                             │
                │ Keep the className for sizing.                              │
                └─────────────────────────────────────────────────────────────┘
              */}
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-900 via-forest-900 to-ink overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(180,255,57,0.18) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute inset-x-0 -top-1/2 h-full bg-gradient-radial from-coral-500/30 via-transparent to-transparent blur-3xl" />

                {/* Big play button — animates on hover */}
                <button className="relative grid place-items-center">
                  <span className="absolute inset-0 rounded-full bg-coral-500/30 animate-ping" style={{ animationDuration: "2s" }} />
                  <span className="absolute -inset-4 rounded-full bg-coral-500/15" />
                  <span className="relative grid h-20 w-20 md:h-28 md:w-28 place-items-center rounded-full bg-coral-500 text-cream-50 shadow-pop transition-transform group-hover:scale-110">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </span>
                </button>
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-cream-50">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cream-50/55">Product walkthrough</div>
                    <div className="text-lg font-bold mt-0.5">Sign up · hire · escrow · payout</div>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 text-[12px] text-cream-50/65">
                    <span className="h-2 w-2 rounded-full bg-coral-400" />
                    <span>1:32</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-ink/45">Coming soon. Real-time recording of a customer hiring an artisan, escrow funding through Squad, and a worker getting paid in T+1.</p>
        </section>

        {/* DISCOVERY — the new headline feature */}
        <section id="discover" className="py-16 md:py-24 reveal">
          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <div>
              <SectionLabel>Discovery</SectionLabel>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tightest leading-[1.02]">
                Snapchat-style map.<br />
                <span className="text-ink/55">25,000+ artisans, already on it.</span>
              </h2>
              <p className="mt-5 text-ink/65 leading-relaxed max-w-xl text-[15px]">
                We don't wait for artisans to sign up. Squadco scrapes public Instagram, Jiji, WhatsApp Business and Google Maps listings — then pins every Lagos service-provider on a live map. Tap any pin to see their work, socials, reviews, and a one-tap <b className="text-ink">Hire</b> button that opens an escrow flow.
              </p>
              <p className="mt-3 text-ink/65 leading-relaxed max-w-xl text-[15px]">
                When the artisan claims their profile, we run a <b className="text-ink">trust check</b> — NIN ↔ BVN ↔ bank account name fuzzy match ↔ Squad transaction history. Customers see the score before they hire.
              </p>
              <div className="mt-7 grid grid-cols-3 gap-3 max-w-md">
                <Stat label="Pre-mapped artisans" value="25k+" />
                <Stat label="Sources scraped" value="6" />
                <Stat label="Claim → verify" value="3 min" />
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/app/map"><Button>Open map →</Button></Link>
                <Link href="/app/discover"><Button variant="outline">Grid view</Button></Link>
              </div>
            </div>

            {/* Stylised map preview — Snap-Map style with avatar pins */}
            <SnapMapPreview />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-16 md:py-24 reveal">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tightest max-w-3xl">A bank account is the bonus for showing up.</h2>
          <p className="mt-4 text-ink/65 max-w-2xl leading-relaxed">No CV. No upfront deposit risk. No payment anxiety. The four-step flow that makes 8k–60k jobs safe enough for both sides to actually transact.</p>

          <div className="mt-10 grid md:grid-cols-4 gap-4">
            {[
              { n: "01", t: "Onboard", d: "NIN + selfie + ISO-30107 liveness in 30 seconds. Powered by Smile ID.", tone: "white" as const, glyph: <IdIcon /> },
              { n: "02", t: "Match", d: "AI ranks workers by skill, distance, language. Pidgin is fine — it parses it.", tone: "ink" as const, glyph: <TargetIcon /> },
              { n: "03", t: "Escrow", d: "Squad Dynamic VA holds funds. Released on dual confirmation.", tone: "coral" as const, glyph: <LockIcon /> },
              { n: "04", t: "Earn + grow", d: "Money in T+1. Squadco Score builds. GT MFB unlocks loans up to ₦500k.", tone: "forest" as const, glyph: <RocketIcon /> },
            ].map((s, i) => (
              <StepCard key={i} {...s} />
            ))}
          </div>
        </section>

        {/* WHY IT WINS — Trust stack */}
        <section id="trust" className="py-16 md:py-24 reveal">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
            <div>
              <SectionLabel>Why it wins</SectionLabel>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tightest">The 4-layer trust stack.</h2>
              <p className="mt-4 text-ink/65 leading-relaxed">Each layer costs cents. Together they're unforgeable. A fraudster would need a real NIN, matching BVN, a real face, a live person, on a clean device. <b className="text-ink">99.5% of attacks blocked at the door.</b></p>
              <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
                <Stat label="Smile ID accuracy" value="99.8%" />
                <Stat label="2024 bank fraud losses" value="₦42.6bn" />
                <Stat label="NDPA fine ceiling" value="₦10m" />
                <Stat label="Liveness ISO" value="30107-3" />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { n: "04", t: "Liveness", c: "3D depth + blink + head-turn. ISO 30107-3 Level 2.", price: "~₦150–500/check", tone: "white" as const },
                { n: "03", t: "Face match ↔ NIN photo", c: "99.8% accuracy on African skin tones. 90% threshold to pass.", price: "~₦100–300/match", tone: "white" as const },
                { n: "02", t: "BVN lookup ↔ bank truth", c: "Confirms NIN-named person owns the payout account. Blocks 80% of mule fraud.", price: "~₦40–100/lookup", tone: "white" as const },
                { n: "01", t: "NIN validation ↔ identity truth", c: "Pulls name, DOB, photo from NIMC. 127m enrolled, Dec 2025.", price: "~₦20–50/lookup", tone: "white" as const },
              ].map((l, i) => (
                <div key={i} className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 px-5 py-4 flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-ink text-cream-50 text-[12px] font-bold">{l.n}</div>
                  <div className="flex-1">
                    <div className="font-semibold tracking-tight">{l.t}</div>
                    <div className="text-[13px] text-ink/65 mt-0.5">{l.c}</div>
                  </div>
                  <div className="text-[11px] font-mono text-ink/55 mt-1">{l.price}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SQUAD INSIDE */}
        <section id="squad" className="py-16 md:py-24 reveal">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <SectionLabel>Squad inside</SectionLabel>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tightest">8 Squad products. One escrow flow.</h2>
              <p className="mt-4 text-ink/65 leading-relaxed">Customer pays via Payment Modal → Dynamic Virtual Account holds the cash → HMAC-signed webhook fires our state machine → dual confirmation → Transfer API pays the worker → Squad SMS notifies them. Real, live, with idempotent transaction refs.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Payment Modal","Dynamic VA","Webhooks (HMAC-SHA512)","Account Lookup","Transfer API","Refunds","Merchant Transactions","VAS · SMS"].map((x) => (
                  <span key={x} className="rounded-full bg-ink text-cream-50 px-3 py-1.5 text-[12px] font-semibold">{x}</span>
                ))}
              </div>
            </div>

            {/* ── Premium code showcase: Mac chrome + line numbers + syntax highlight ── */}
            <div className="group relative">
              {/* Glow halo on hover */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-coral-500/20 via-gold-400/20 to-forest-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />

              <div className="relative rounded-2xl bg-[#0c1c17] text-cream-50 overflow-hidden ring-1 ring-cream-50/8 shadow-2xl shadow-ink/40">
                {/* Window chrome */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#081410] border-b border-cream-50/8">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 text-[11px] font-mono text-cream-50/55">lib/squad.ts <span className="text-cream-50/35">·</span> line 103</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative inline-flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-forest-400" />
                    </span>
                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-forest-300">200 OK · 312ms</span>
                  </div>
                </div>

                {/* Endpoint header */}
                <div className="px-4 lg:px-6 pt-4 pb-1 flex items-center gap-2 border-b border-cream-50/5">
                  <span className="rounded-md bg-coral-500/15 text-coral-300 px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider">POST</span>
                  <span className="font-mono text-[11px] text-cream-50/75 truncate">/virtual-account/create-dynamic-virtual-account</span>
                </div>

                {/* Code body with line numbers */}
                <div className="px-4 lg:px-6 py-5 font-mono text-[12.5px] leading-[1.8] overflow-x-auto">
                  <div className="grid grid-cols-[1.75rem_1fr] gap-x-3">
                    {[
                      <><span className="tok-kw">await</span> <span className="tok-fn">SQUAD</span><span className="tok-pn">.</span><span className="tok-fn">post</span><span className="tok-pn">(</span></>,
                      <span className="pl-3"><span className="tok-str">{`"/virtual-account/create-dynamic-virtual-account"`}</span><span className="tok-pn">, {`{`}</span></span>,
                      <span className="pl-6"><span className="tok-key">transaction_ref</span><span className="tok-pn">:</span> <span className="tok-tpl">{"`${MERCHANT}-${jobId}`"}</span><span className="tok-pn">,</span></span>,
                      <span className="pl-6"><span className="tok-key">amount</span><span className="tok-pn">:</span> <span className="tok-num">15000</span> <span className="tok-pn">*</span> <span className="tok-num">100</span><span className="tok-pn">,</span> <span className="tok-cm">// kobo</span></span>,
                      <span className="pl-6"><span className="tok-key">currency_id</span><span className="tok-pn">:</span> <span className="tok-str">{`"NGN"`}</span><span className="tok-pn">,</span></span>,
                      <span className="pl-6"><span className="tok-key">customer_identifier</span><span className="tok-pn">:</span> <span className="tok-id">customer</span><span className="tok-pn">.</span><span className="tok-id">name</span><span className="tok-pn">,</span></span>,
                      <span className="pl-6"><span className="tok-key">beneficiary_account</span><span className="tok-pn">:</span> <span className="tok-const">GTBANK_SETTLEMENT</span><span className="tok-pn">,</span></span>,
                      <span className="pl-6"><span className="tok-key">expiry_seconds</span><span className="tok-pn">:</span> <span className="tok-num">3600</span><span className="tok-pn">,</span></span>,
                      <span className="pl-3"><span className="tok-pn">{`}`});</span></span>,
                      <span className="h-3" />,
                      <span className="tok-cm">{`// → returns NUBAN. Customer transfers via NIP.`}</span>,
                      <span className="tok-cm">{`// → webhook fires `}<span className="text-gold-300/90">charge_successful</span>{` w/ HMAC-SHA512.`}</span>,
                      <span className="tok-cm">{`// → job.state = `}<span className="text-forest-300">FUNDED</span>{`. Worker dispatched.`}</span>,
                    ].map((line, i) => (
                      <Fragment key={i}>
                        <span className="text-cream-50/25 select-none text-right tabular-nums">{i + 1}</span>
                        <span className="whitespace-pre">{line}</span>
                      </Fragment>
                    ))}
                  </div>
                </div>

                {/* Bottom info bar */}
                <div className="px-4 lg:px-6 py-2.5 bg-[#081410] border-t border-cream-50/8 flex items-center justify-between text-[10px] text-cream-50/45 font-mono">
                  <span>merchant <span className="text-gold-300">UE632HMD</span></span>
                  <span>HMAC-SHA512 verified</span>
                  <span className="hidden sm:inline">Idempotent ref</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ECONOMICS */}
        <section id="economics" className="py-16 md:py-24 reveal">
          <SectionLabel>The math</SectionLabel>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tightest max-w-3xl">Five revenue streams stack. Commission alone can't survive Nigerian CAC.</h2>

          <div className="mt-10 grid md:grid-cols-5 gap-3">
            {[
              { t: "Take rate",      v: "₦1,050",  s: "7% per ₦15k job. Below SweepSouth's 15%, above Wrkman's 10%.", tone: "white" as const },
              { t: "Squad fees",     v: "₦60",     s: "0.25% VA + 1.2% gateway + ₦20 transfer. Captured by GTCO.",     tone: "white" as const },
              { t: "Float yield",    v: "₦52m/mo", s: "At 1M MAU, 17% T-bills on 3-day escrow holds.",                  tone: "coral" as const },
              { t: "CASA",           v: "₦2bn",    s: "100k workers × ₦20k avg balance = cheap funding for GTBank.",     tone: "forest" as const },
              { t: "Embedded credit",v: "₦4bn NIM",s: "GT MFB lends on Squadco Score. Carbon's playbook on Squad data.",   tone: "gold" as const },
            ].map((x, i) => {
              const cls = x.tone === "white" ? "bg-cream-50 text-ink ring-1 ring-ink/10" : x.tone === "coral" ? "bg-coral-500 text-cream-50" : x.tone === "forest" ? "bg-forest-900 text-cream-50" : "bg-gold-400 text-ink";
              return (
                <div key={i} className={"rounded-2xl p-5 " + cls}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-65">{x.t}</div>
                  <div className="mt-2 text-3xl font-bold tracking-tightest">{x.v}</div>
                  <p className="mt-3 text-[12px] opacity-80 leading-snug">{x.s}</p>
                </div>
              );
            })}
          </div>

          {/* Per-job waterfall */}
          <div className="mt-8 rounded-3xl bg-ink-900 text-cream-50 p-6 lg:p-8 ring-1 ring-ink/20">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cream-50/55">Per-job waterfall</div>
                <div className="font-display text-2xl font-bold tracking-tightest mt-1">A single ₦15,000 job, end to end</div>
              </div>
              <div className="text-[12px] text-cream-50/55">
                Contribution margin: <span className="font-bold text-gold-400">₦1,011</span> per job
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <Waterfall label="Customer pays" v="+₦15,000" tone="white" />
              <Waterfall label="Squad VA 0.25%" v="−₦38" tone="cream" />
              <Waterfall label="Squadco fee 7%" v="−₦1,050" tone="coral" />
              <Waterfall label="Squad transfer" v="−₦20" tone="cream" />
              <Waterfall label="Worker nets" v="₦13,892" tone="forest" />
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="py-20 md:py-28 text-center">
          <h2 className="font-display text-4xl md:text-6xl font-bold leading-[0.95] tracking-tightest max-w-4xl mx-auto">
            Every handshake becomes <span className="italic text-coral-500">escrow.</span><br />
            Every escrow becomes <span className="italic text-coral-500">credit data.</span><br />
            <span className="underline decoration-gold-400 decoration-[6px] underline-offset-[10px]">Squad</span> is the engine.
          </h2>
          <div className="mt-10 flex justify-center gap-3 flex-wrap">
            <Link href="/auth"><Button size="lg">Open the app →</Button></Link>
            <Link href="/operator"><Button size="lg" variant="outline">Operator console</Button></Link>
          </div>
          <p className="mt-8 text-[12px] text-ink/45 max-w-md mx-auto">
            Built on Squad APIs for Nigeria's 92.3% informal workforce.
          </p>
        </section>

        <footer className="py-10 border-t border-ink/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink/45">
          <div className="flex items-center gap-2"><Logo size={20} /><span>· {new Date().getFullYear()} · NDPA-ready Day 1</span></div>
          <div>Built on Squad APIs. Submission only.</div>
        </footer>
      </div>
    </main>
  );
}

/* ───────────────── helpers ───────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-coral-500"><span className="h-1 w-6 bg-coral-500" />{children}</div>;
}

function BrandPill({ label }: { label: string }) {
  return <span className="rounded-full bg-cream-50 ring-1 ring-ink/12 px-3 py-1 font-semibold text-ink">{label}</span>;
}

// Floating Bitmoji avatars around the phone in the hero
function FloatingAvatars() {
  const items = [
    { seed: "Tunde", x: -38, y: 30, delay: 0, size: 56, bg: "F0A04A" },
    { seed: "Aisha", x: 88, y: 8, delay: 1, size: 48, bg: "3E8E5C" },
    { seed: "Chioma", x: 96, y: 78, delay: 2, size: 52, bg: "E04848" },
    { seed: "Folake", x: -42, y: 88, delay: 0.5, size: 44, bg: "F4C994" },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden>
      {items.map((it, i) => (
        <div key={i} className="absolute float" style={{ left: `${it.x}%`, top: `${it.y}%`, animationDelay: `${it.delay}s` }}>
          <div className="relative">
            <img
              src={bitmojiUrl(it.seed, "notionists", it.size * 2, it.bg)}
              width={it.size}
              height={it.size}
              alt=""
              className="rounded-full ring-[3px] ring-cream-50 shadow-card"
              style={{ animation: `wiggle ${3 + i}s ease-in-out infinite` }}
            />
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-forest-500 ring-2 ring-cream-50 text-cream-50 text-[10px] font-bold">✓</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Snap-Map-style preview for the Discovery section
function SnapMapPreview() {
  const pins = [
    { seed: "Tunde",   x: 70,  y: 90,  badge: "⚡", top: true,  verified: false },
    { seed: "Musa",    x: 200, y: 150, badge: "❄️", top: false, verified: true },
    { seed: "Sade",    x: 320, y: 110, badge: "🪡", top: false, verified: false },
    { seed: "Folake",  x: 130, y: 230, badge: "💇", top: true,  verified: false },
    { seed: "Emeka",   x: 260, y: 220, badge: "🔧", top: false, verified: true },
    { seed: "Tobi",    x: 80,  y: 320, badge: "📸", top: false, verified: false },
    { seed: "Bola",    x: 220, y: 320, badge: "🎨", top: true,  verified: false },
    { seed: "Aisha",   x: 340, y: 280, badge: "⌨️", top: false, verified: true },
  ];
  return (
    <div className="relative">
      <div className="rounded-3xl bg-cream-50 ring-1 ring-ink/10 shadow-card p-3 overflow-hidden">
        <div className="relative h-[460px] rounded-2xl bg-[#EDE5D4] overflow-hidden">
          {/* Faux streets */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 460" preserveAspectRatio="none">
            <path d="M0 80 L400 60" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
            <path d="M0 180 L400 200" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
            <path d="M0 290 L400 280" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
            <path d="M0 410 L400 390" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
            <path d="M70 0 L90 460" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
            <path d="M210 0 L230 460" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
            <path d="M330 0 L340 460" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
            <path d="M0 230 Q150 220 220 240 T400 240" stroke="rgba(62,142,92,0.20)" strokeWidth="22" fill="none" />
          </svg>

          {/* Avatar pins, Snapchat-style */}
          {pins.map((p, i) => (
            <div
              key={i}
              className="absolute float"
              style={{ left: p.x, top: p.y, transform: "translate(-50%, -100%)", animationDelay: `${i * 0.4}s`, animationDuration: `${3 + (i % 3)}s` }}
            >
              <div className="relative" style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.22))" }}>
                <div className={"h-12 w-12 rounded-full overflow-hidden ring-[3px] " + (p.top ? "ring-gold-400" : p.verified ? "ring-forest-500" : "ring-ink")}>
                  <img src={bitmojiUrl(p.seed, "notionists", 96)} width={48} height={48} alt="" className="block" />
                </div>
                {p.top && (
                  <span className="absolute -top-1 -right-1 grid h-5 px-1 min-w-[20px] place-items-center rounded-full bg-gold-400 ring-2 ring-cream-50 text-ink text-[9px] font-bold">★</span>
                )}
                {p.badge && (
                  <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-ink ring-2 ring-cream-50 text-cream-50 text-[12px]">{p.badge}</span>
                )}
              </div>
            </div>
          ))}

          {/* "You" pin */}
          <div className="absolute" style={{ left: 180, top: 270 }}>
            <span className="absolute -inset-3 rounded-full bg-coral-500/30 snap-ping" />
            <span className="block h-4 w-4 rounded-full bg-coral-500 ring-[3px] ring-cream-50" />
          </div>

          {/* Pop card with Bitmoji */}
          <div className="absolute left-3 right-3 bottom-3 rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-3 shadow-card pop">
            <div className="flex items-center gap-3">
              <img src={bitmojiUrl("Tunde", "notionists", 88, "F0A04A")} width={44} height={44} alt="" className="rounded-full ring-[3px] ring-cream-50 shadow-card shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[13px] tracking-tight truncate">Gen Genius Lagos</span>
                  <span className="rounded-full bg-gold-400 text-ink text-[9px] font-bold px-1.5 py-0.5">★ TOP 92</span>
                </div>
                <div className="text-[11px] text-ink/55">Lekki · ★ 4.8 · 132 jobs · @gengeniuslagos · WhatsApp ✓</div>
              </div>
              <span className="rounded-full bg-coral-500 text-cream-50 text-[11px] font-bold px-3 py-1.5 shrink-0">Hire</span>
            </div>
          </div>
        </div>
      </div>
      {/* Floating "Online now" mini-pill */}
      <div className="absolute -top-2 -right-2 rounded-full bg-forest-500 text-cream-50 text-[11px] font-bold px-3 py-1.5 shadow-card spring-in flex items-center gap-1.5">
        <span className="relative grid h-2 w-2"><span className="absolute inset-0 rounded-full bg-cream-50 animate-ping" /><span className="relative h-2 w-2 rounded-full bg-cream-50" /></span>
        24 online near you
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tightest">{value}</div>
    </div>
  );
}

function StepCard({ n, t, d, tone, glyph }: { n: string; t: string; d: string; tone: "white" | "ink" | "coral" | "forest"; glyph: React.ReactNode }) {
  const cls = tone === "white" ? "bg-cream-50 text-ink ring-1 ring-ink/10" : tone === "ink" ? "bg-ink text-cream-50" : tone === "coral" ? "bg-coral-500 text-cream-50" : "bg-forest-900 text-cream-50";
  return (
    <div className={"rounded-3xl p-6 flex flex-col gap-3 " + cls}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono opacity-65">step {n}</span>
        <span className="opacity-90">{glyph}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tightest">{t}</div>
      <p className="text-[13px] opacity-80 leading-relaxed">{d}</p>
    </div>
  );
}

function Waterfall({ label, v, tone }: { label: string; v: string; tone: "white" | "cream" | "coral" | "forest" }) {
  const cls = tone === "white" ? "bg-cream-50 text-ink" : tone === "cream" ? "bg-cream-50/15 text-cream-50/85" : tone === "coral" ? "bg-coral-500 text-cream-50" : "bg-forest-500 text-cream-50";
  return (
    <div className={"rounded-2xl px-3 py-4 " + cls}>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-1 text-lg font-bold tracking-tightest">{v}</div>
    </div>
  );
}

/* ───────── icons (line-style, no emoji) ───────── */
function IdIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M5 17c0-2 2-3 4-3s4 1 4 3"/><path d="M15 9h4M15 13h3"/></svg>; }
function TargetIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>; }
function LockIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>; }
function RocketIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c2-2 5-3 7-3M5 19c-2 1-3 0-2-2 1-2 2-3 4-4"/><path d="M14 4c5 0 6 1 6 6 0 4-3 7-7 9-3 1-5-1-4-4 2-4 5-7 9-7"/><circle cx="15" cy="9" r="2"/></svg>; }

/* ───────── Phone mock — directly mirrors the deck's "Today's jobs" screen ───────── */
function PhoneMock() {
  return (
    <div className="relative w-[300px] md:w-[340px] mx-auto select-none">
      <div className="rounded-[44px] bg-ink-900 ring-[8px] ring-ink-900 shadow-soft overflow-hidden">
        <div className="rounded-[36px] bg-cream-200 h-[640px] relative overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3.5">
            <span className="text-[11px] font-semibold text-ink">9:41</span>
            <div className="h-6 w-20 rounded-full bg-ink-900" />
            <div className="flex items-center gap-1.5 text-ink">
              <span className="font-bold tracking-tighter">···</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          </div>

          <div className="px-5 pt-6">
            <div className="flex items-end justify-between">
              <h3 className="text-[22px] font-bold tracking-tightest text-ink leading-none">Today's jobs</h3>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">FILTER</span>
            </div>
          </div>

          {/* Job cards — mirror the screenshot exactly */}
          <div className="px-5 mt-5 space-y-2.5">
            <MiniJob title="Plumbing fix" sub="Surulere · 1.2km · ★4.6" price="₦8k" tone="ink" />
            <MiniJob title="Generator repair" sub="Lekki · 2.8km · URGENT" price="₦15k" tone="coral" urgent />
            <MiniJob title="AC service" sub="Yaba · 3.1km · ★4.9" price="₦12k" tone="white" />
            <MiniJob title="Errand · pickup" sub="Ikeja · 0.8km" price="₦3.5k" tone="white" />
            <MiniJob title="Data entry · remote" sub="3-day · ★4.7" price="₦25k" tone="forest" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniJob({ title, sub, price, tone, urgent }: { title: string; sub: string; price: string; tone: "ink" | "coral" | "white" | "forest"; urgent?: boolean }) {
  const cardCls = tone === "ink" ? "bg-ink-900 text-cream-50" : tone === "coral" ? "bg-coral-500 text-cream-50 ring-1 ring-gold-400" : tone === "forest" ? "bg-forest-900 text-cream-50" : "bg-cream-50 text-ink ring-1 ring-ink/12";
  const pillCls = tone === "ink" ? "bg-cream-50 text-ink" : tone === "coral" ? "bg-gold-400 text-ink" : tone === "forest" ? "bg-cream-100 text-ink" : "bg-ink text-cream-50";
  return (
    <div className={"rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 " + cardCls}>
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold tracking-tight leading-tight truncate">{title}</div>
        <div className="text-[10.5px] opacity-70 truncate">{sub}</div>
      </div>
      <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold " + pillCls}>{price}</span>
    </div>
  );
}
