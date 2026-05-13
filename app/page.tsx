import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

export default function Landing() {
  return (
    <main className="relative overflow-hidden text-ink">
      {/* Top navigation */}
      <div className="relative mx-auto max-w-6xl px-5">
        <header className="flex items-center justify-between pt-6">
          <Logo size={30} />
          <nav className="hidden md:flex items-center gap-7 text-sm text-ink/65">
            <a href="#discover" className="hover:text-ink">Discovery</a>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#trust" className="hover:text-ink">Trust stack</a>
            <a href="#squad" className="hover:text-ink">Squad inside</a>
            <a href="#economics" className="hover:text-ink">Economics</a>
            <Link href="/operator" className="hover:text-ink">Operator</Link>
          </nav>
          <Link href="/auth"><Button size="sm">Open app</Button></Link>
        </header>

        {/* HERO — tells the story in 3 seconds */}
        <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center pt-12 lg:pt-20 pb-20">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full bg-ink/8 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-coral-500 dot" />
              <span>Squad Hackathon 3.0 · Challenge 02</span>
            </div>

            <h1 className="mt-6 font-display text-[44px] sm:text-[56px] lg:text-[80px] font-bold leading-[0.92] tracking-tightest text-ink">
              Hire Nigeria's <span className="italic text-coral-500">hustle.</span>
              <br />
              Pay only when <span className="underline decoration-gold-400 decoration-[6px] underline-offset-[10px]">it's done.</span>
            </h1>

            <p className="mt-7 max-w-xl text-ink/70 text-[17px] leading-relaxed">
              <b className="text-ink">Squadco Escrow</b> is the discovery + escrow-protected job marketplace for the <b className="text-ink">92% of Nigerians</b> who work informally. 25,000+ artisans already pinned on the map. NIN-verified. Funds locked in a Squad Virtual Account. T+1 to bank, every time.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/auth?role=customer"><Button size="lg">Post a job →</Button></Link>
              <Link href="/auth?role=worker"><Button size="lg" variant="outline">Get hired today</Button></Link>
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex items-center gap-5 flex-wrap text-[12px] text-ink/55">
              <span className="font-semibold uppercase tracking-[0.15em] text-ink/40">Powered by</span>
              <BrandPill label="Squad" />
              <BrandPill label="HabariPay" />
              <BrandPill label="GTBank" />
              <BrandPill label="Smile ID" />
              <BrandPill label="NIBSS" />
            </div>
          </div>

          {/* PHONE MOCK — directly mirrors deck screen 2 (Today's jobs feed) */}
          <div className="relative lg:justify-self-end">
            <div className="absolute -inset-12 bg-gold-grad opacity-30 blur-3xl rounded-full" aria-hidden />
            <PhoneMock />
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="-mt-6 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 rounded-3xl bg-ink text-cream-50 ring-1 ring-ink/10 overflow-hidden">
            {[
              { v: "92.3%", t: "of NG workers are informal" },
              { v: "127m", t: "Nigerians on NIN (Dec 2025)" },
              { v: "₦70k", t: "monthly minimum wage" },
              { v: "8", t: "Squad products woven in" },
            ].map((x, i) => (
              <div key={i} className={"px-5 py-6 sm:px-7 sm:py-8 " + (i > 0 ? "md:border-l border-cream-50/10" : "") + (i > 0 && i < 2 ? " border-l border-cream-50/10" : "")}>
                <div className="text-[40px] sm:text-[52px] font-bold tracking-tightest leading-none text-cream-50">{x.v}</div>
                <div className="mt-2 text-[12px] uppercase tracking-[0.14em] text-cream-50/60">{x.t}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DISCOVERY — the new headline feature */}
        <section id="discover" className="py-16 md:py-24">
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

            {/* Stylised map preview */}
            <div className="relative">
              <div className="rounded-3xl bg-cream-50 ring-1 ring-ink/10 shadow-card p-3 overflow-hidden">
                <div className="relative h-[420px] rounded-2xl bg-[#EDE5D4] overflow-hidden">
                  {/* Faux streets */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 420" preserveAspectRatio="none">
                    <path d="M0 80 L400 60" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
                    <path d="M0 180 L400 200" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
                    <path d="M0 290 L400 280" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
                    <path d="M0 380 L400 360" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
                    <path d="M70 0 L90 420" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
                    <path d="M210 0 L230 420" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
                    <path d="M330 0 L340 420" stroke="rgba(10,10,10,0.08)" strokeWidth="14" />
                    <path d="M0 230 Q150 220 220 240 T400 240" stroke="rgba(62,142,92,0.18)" strokeWidth="22" fill="none" />
                  </svg>
                  {/* Pins */}
                  {[
                    { x: 70, y: 90, c: "#0E2A1F", r: "#F0A04A", emoji: "⚡", label: "Gen Genius" },
                    { x: 200, y: 150, c: "#3E8E5C", emoji: "❄️" },
                    { x: 320, y: 110, c: "#F0A04A", emoji: "🪡" },
                    { x: 130, y: 230, c: "#0E2A1F", r: "#F0A04A", emoji: "💇" },
                    { x: 260, y: 220, c: "#3E8E5C", emoji: "🔧" },
                    { x: 80, y: 320, c: "#F0A04A", emoji: "📸" },
                    { x: 220, y: 320, c: "#0E2A1F", r: "#F0A04A", emoji: "🎨" },
                    { x: 340, y: 280, c: "#3E8E5C", emoji: "⌨️" },
                  ].map((p, i) => (
                    <div key={i} className="absolute" style={{ left: p.x, top: p.y, transform: "translate(-50%, -100%)" }}>
                      <div className="relative" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "14px 14px 14px 4px", background: p.c, border: `2px solid ${p.r || "#0A0A0A"}`, transform: "rotate(-8deg)", display: "grid", placeItems: "center" }}>
                          <span style={{ fontSize: 18, transform: "rotate(8deg)" }}>{p.emoji}</span>
                        </div>
                        {p.r && <span className="absolute top-[-4px] right-[-4px] h-3.5 w-3.5 rounded-full bg-gold-400 border-2 border-cream-50" />}
                      </div>
                    </div>
                  ))}
                  {/* "You" pin */}
                  <div className="absolute" style={{ left: 180, top: 260 }}>
                    <span className="absolute -inset-3 rounded-full bg-coral-500/30 animate-ping" />
                    <span className="block h-4 w-4 rounded-full bg-coral-500 ring-[3px] ring-cream-50" />
                  </div>
                  {/* Pop card */}
                  <div className="absolute left-3 right-3 bottom-3 rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-3 shadow-card">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-cream-50 text-lg shrink-0">⚡</div>
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
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-16 md:py-24">
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
        <section id="trust" className="py-16 md:py-24">
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
        <section id="squad" className="py-16 md:py-24">
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

            <div className="rounded-3xl bg-forest-900 text-cream-50 p-6 lg:p-7 font-mono text-[12.5px] leading-relaxed overflow-x-auto ring-1 ring-ink/20">
              <div className="text-gold-400 text-[10px] tracking-[0.18em] uppercase mb-3 font-sans font-semibold">POST /virtual-account/create-dynamic-virtual-account</div>
              <pre className="text-cream-50/90 whitespace-pre">{`await SQUAD.post(
  "/virtual-account/create-dynamic-virtual-account", {
    transaction_ref: \`\${MERCHANT}-\${jobId}\`,
    amount: 15000 * 100, // kobo
    currency_id: "NGN",
    customer_identifier: customer.name,
    beneficiary_account: GTBANK_SETTLEMENT,
    expiry_seconds: 3600,
  });
// → returns NUBAN. Customer transfers via NIP.
// → webhook fires \`charge_successful\` w/ HMAC.
// → job.state = FUNDED. Worker is dispatched.`}</pre>
            </div>
          </div>
        </section>

        {/* ECONOMICS */}
        <section id="economics" className="py-16 md:py-24">
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
            It's a dating app for jobs,<br />
            with a <span className="italic text-coral-500">bank</span> inside,<br />
            and <span className="underline decoration-gold-400 decoration-[6px] underline-offset-[10px]">Squad</span> is the heart.
          </h2>
          <div className="mt-10 flex justify-center gap-3 flex-wrap">
            <Link href="/auth"><Button size="lg">Open the app →</Button></Link>
            <Link href="/operator"><Button size="lg" variant="outline">Operator console</Button></Link>
          </div>
          <p className="mt-8 text-[12px] text-ink/45 max-w-md mx-auto">
            Built for GTCO Squad Hackathon 3.0 · Challenge 02 · Smart Systems for the Intelligent Economy
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
