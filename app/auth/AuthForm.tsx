"use client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useState, useEffect, useRef } from "react";

type Mode = "signin" | "signup";

export function AuthForm({ initialRole }: { initialRole?: "worker" | "customer" }) {
  // Default mode is informed by ?role= — coming in via "Get hired today" or
  // "Post a job" buttons usually means the user is signing up for the first
  // time. Otherwise default to sign-in because that's the more common case.
  const [mode, setMode] = useState<Mode>(initialRole ? "signup" : "signin");
  const [step, setStep] = useState<"phone" | "otp" | "name" | "role">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"worker" | "customer" | "both">(initialRole || "worker");
  const [hintOtp, setHintOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRef.current?.focus(), 50);
  }, [step]);

  // If the mode the user picked doesn't match the truth from the server,
  // we surface a friendly inline warning rather than just silently doing the
  // opposite of what they asked for.
  const modeMismatch =
    step === "otp" && ((mode === "signin" && !existing) || (mode === "signup" && existing));

  async function sendOtp() {
    setError(null); setLoading(true);
    try {
      const r = await fetch("/api/auth/otp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "Could not send OTP");
      setHintOtp(d.demo_otp || null);
      setExisting(!!d.existing);
      setStep("otp");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function verifyOtp() {
    setError(null); setLoading(true);
    try {
      const r = await fetch("/api/auth/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone, code: otp }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "Bad code");
      // Hard navigation (not router.push) so the browser does a fresh request
      // that's guaranteed to include the just-set jara_session cookie.
      if (d.new_user) setStep("name"); else window.location.href = "/app/feed";
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function completeProfile() {
    setError(null); setLoading(true);
    try {
      const r = await fetch("/api/auth/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, role }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "Failed");
      window.location.href = "/onboard";
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function demoSignIn(demoPhone: string, label: string) {
    setError(null); setDemoLoading(label);
    try {
      const r = await fetch("/api/auth/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone: demoPhone }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "Demo sign-in failed");
      window.location.href = "/app/feed";
    } catch (e: any) {
      setError(e.message);
      setDemoLoading(null);
    }
  }

  const signinAccent = mode === "signin";

  return (
    <div className={"rounded-3xl bg-cream-50 ring-1 p-6 animate-rise transition-colors " + (signinAccent ? "ring-ink/10" : "ring-coral-500/30")}>
      {/* Mode toggle — purely a UI affordance so the user knows what they're doing.
          The phone+OTP flow handles both cases transparently regardless of mode. */}
      {step === "phone" && (
        <>
          <div className="mb-5 rounded-2xl bg-cream-100 ring-1 ring-ink/10 p-1 grid grid-cols-2 gap-1 text-[14px] font-semibold">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={"rounded-xl py-2.5 transition " + (mode === "signin" ? "bg-ink text-cream-50 shadow-card" : "text-ink/55 hover:text-ink")}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={"rounded-xl py-2.5 transition " + (mode === "signup" ? "bg-coral-500 text-cream-50 shadow-card" : "text-ink/55 hover:text-ink")}
            >
              Sign up
            </button>
          </div>
          <div className="mb-4 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-center text-ink/45">
            {mode === "signin" ? "Returning to Squadco" : "Brand-new account"}
          </div>
        </>
      )}

      {step === "phone" && (
        <div className="space-y-5">
          <div>
            <h2 className="font-display text-[22px] font-bold tracking-tightest">
              {mode === "signin" ? "Welcome back." : "Let's get you started."}
            </h2>
            <p className="text-[13px] text-ink/60 mt-1">
              {mode === "signin"
                ? "Enter the phone you signed up with — we'll text you a 6-digit code."
                : "Just your phone to begin. Profile setup takes ~3 minutes."}
            </p>
          </div>
          <Input
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoFocus
            placeholder="+234 801 234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            hint="We'll send a 6-digit code by SMS (Squad VAS in production)"
          />
          <Button block size="lg" loading={loading} onClick={sendOtp} disabled={phone.length < 6} variant={mode === "signup" ? "primary" : "dark"}>
            {mode === "signin" ? "Send sign-in code →" : "Create account →"}
          </Button>
          {error && <p className="text-coral-600 text-sm text-center">{error}</p>}

          <div className="hairline" />

          {/* One-tap demo sign-in — judges' fast path */}
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-ink/45 text-center mb-2">
              Hackathon demo · one-tap sign in
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => demoSignIn("+2348077890123", "hire")}
                disabled={!!demoLoading}
                className="rounded-2xl ring-1 ring-ink/10 bg-cream-50 px-3 py-3 hover:bg-ink/5 transition text-left disabled:opacity-50"
              >
                <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-coral-600">For hire</div>
                <div className="font-bold text-[14px] tracking-tight mt-0.5">Mrs. Okonkwo</div>
                <div className="text-[11px] text-ink/55 mt-0.5">Customer · post jobs, fund escrow{demoLoading === "hire" ? " · loading…" : ""}</div>
              </button>
              <button
                type="button"
                onClick={() => demoSignIn("+2348011234567", "apply")}
                disabled={!!demoLoading}
                className="rounded-2xl ring-1 ring-ink/10 bg-cream-50 px-3 py-3 hover:bg-ink/5 transition text-left disabled:opacity-50"
              >
                <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-forest-700">For apply</div>
                <div className="font-bold text-[14px] tracking-tight mt-0.5">Tunde Adeleke</div>
                <div className="text-[11px] text-ink/55 mt-0.5">Worker · apply, deliver, get paid{demoLoading === "apply" ? " · loading…" : ""}</div>
              </button>
            </div>
            <div className="text-[10.5px] text-ink/40 text-center mt-2">Skips OTP. Use these to walk judges through the flow end-to-end.</div>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-5">
          <div>
            <h2 className="font-display text-[22px] font-bold tracking-tightest">
              {existing ? "Welcome back." : "Almost there."}
            </h2>
            <div className="text-sm text-ink/70 mt-1">
              Code sent to <span className="font-semibold text-ink">{phone}</span>
              {existing
                ? <span className="ml-2 text-forest-500">· signing you in</span>
                : <span className="ml-2 text-coral-500">· creating new account</span>}
            </div>
          </div>

          {modeMismatch && (
            <div className="rounded-2xl bg-gold-200 ring-1 ring-gold-400 px-4 py-3 text-[12.5px] text-ink">
              {mode === "signin"
                ? <>No account found for this number — we'll create one for you. <button onClick={() => setMode("signup")} className="underline font-semibold ml-1">Switch to Sign up</button></>
                : <>An account already exists for this number — we'll sign you in. <button onClick={() => setMode("signin")} className="underline font-semibold ml-1">Switch to Sign in</button></>}
            </div>
          )}

          <Input
            ref={otpRef}
            label="6-digit code"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="••••••"
            className="text-center tracking-[0.8em] text-xl font-bold"
          />
          {hintOtp && (
            <div className="rounded-2xl bg-gold-200 ring-1 ring-gold-400 px-4 py-3 text-[12.5px] text-ink">
              <span className="font-bold">Demo mode:</span> your OTP is <span className="font-mono font-bold text-lg ml-1">{hintOtp}</span>.
              In production, delivered via Squad VAS · SMS.
            </div>
          )}
          <Button block size="lg" loading={loading} onClick={verifyOtp} disabled={otp.length < 6}>Verify</Button>
          {error && <p className="text-coral-600 text-sm text-center">{error}</p>}
          <button onClick={() => setStep("phone")} className="w-full text-xs text-ink/55 hover:text-ink">Use a different number</button>
        </div>
      )}

      {step === "name" && (
        <div className="space-y-5">
          <div>
            <h2 className="font-display text-[22px] font-bold tracking-tightest">Set up your account.</h2>
            <p className="text-[13px] text-ink/60 mt-1">First time here — pick how you'll use Squadco. You can change this later.</p>
          </div>
          <Input label="Your full name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="As it appears on your NIN" />
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">I'm here to</div>
            <div className="grid grid-cols-2 gap-2">
              <RolePick label="Find work" desc="Apply to jobs" selected={role === "worker"} onClick={() => setRole("worker")} />
              <RolePick label="Hire" desc="Post jobs" selected={role === "customer"} onClick={() => setRole("customer")} />
            </div>
            <button
              onClick={() => setRole("both")}
              className={"mt-2 w-full text-center text-[12px] font-semibold py-2.5 rounded-2xl ring-1 transition " + (role === "both" ? "bg-ink text-cream-50 ring-ink" : "text-ink/60 ring-ink/15 hover:bg-ink/5")}
            >
              I'll do both
            </button>
          </div>
          <Button block size="lg" loading={loading} onClick={completeProfile} disabled={!name.trim()}>Continue to KYC →</Button>
          {error && <p className="text-coral-600 text-sm text-center">{error}</p>}
        </div>
      )}
    </div>
  );
}

function RolePick({ label, desc, selected, onClick }: { label: string; desc: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={"rounded-2xl p-4 text-left ring-1 transition " + (selected ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 text-ink ring-ink/15 hover:bg-ink/5")}>
      <div className="font-bold tracking-tight">{label}</div>
      <div className={"text-[12px] mt-0.5 " + (selected ? "text-cream-50/70" : "text-ink/55")}>{desc}</div>
    </button>
  );
}
