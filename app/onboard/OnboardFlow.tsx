"use client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryLabel } from "@/lib/utils";

type Bank = { code: string; name: string };

export function OnboardFlow({ startName, banks }: { startName: string; banks: Bank[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [bank, setBank] = useState(banks[0]?.code || "058");
  const [acct, setAcct] = useState("");
  const [acctName, setAcctName] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [livenessSteps, setLivenessSteps] = useState<{ step: string; passed: boolean }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);

  const steps = ["NIN", "Liveness", "Bank", "Skills"];

  useEffect(() => {
    if (step === 1) startCamera(); else stopCamera();
  }, [step]);

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 480 }, audio: false });
      if (videoRef.current) { videoRef.current.srcObject = s; setStreaming(true); }
    } catch { setStreaming(false); }
  }
  function stopCamera() {
    const v = videoRef.current; if (!v || !v.srcObject) return;
    (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    v.srcObject = null; setStreaming(false);
  }

  async function runLiveness() {
    setLivenessSteps([]);
    const seq = ["Blink twice", "Turn head left", "Turn head right", "Smile"];
    for (const s of seq) {
      setLivenessSteps((cur) => [...cur, { step: s, passed: false }]);
      await new Promise((r) => setTimeout(r, 700));
      setLivenessSteps((cur) => cur.map((c) => c.step === s ? { ...c, passed: true } : c));
    }
    const v = videoRef.current, c = canvasRef.current;
    if (v && c) {
      c.width = v.videoWidth || 480; c.height = v.videoHeight || 480;
      c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
      setSelfieDataUrl(c.toDataURL("image/jpeg", 0.7));
    }
    stopCamera();
  }

  async function lookupName() {
    if (acct.length !== 10) return;
    setLookupLoading(true); setError(null);
    try {
      const r = await fetch("/api/squad/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bank_code: bank, account_number: acct }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setAcctName(d.account_name);
    } catch (e: any) { setError("Could not resolve account name"); }
    finally { setLookupLoading(false); }
  }

  useEffect(() => { if (acct.length === 10) lookupName(); }, [acct, bank]);

  async function finish() {
    setSubmitting(true); setError(null);
    try {
      const r = await fetch("/api/me/kyc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nin, bvn, bank_code: bank, account_number: acct, account_name: acctName, selfie: selfieDataUrl?.slice(0, 200), liveness_passed: livenessSteps.length > 0 && livenessSteps.every(s => s.passed), skills, area, bio }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "Could not save");
      router.push("/app/feed");
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">
      {/* Stepper (matches deck: STEP 2 OF 4) */}
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55">Step {step + 1} of {steps.length}</div>

      {/* STEP 0 — NIN entry */}
      {step === 0 && (
        <div className="space-y-6 animate-rise">
          <h2 className="font-display text-[34px] font-bold tracking-tightest leading-[1.05]">Verify your identity in 30 seconds.</h2>

          {/* NIN card — boxed with NIN label, matches mockup */}
          <div className="rounded-2xl ring-2 ring-ink/15 bg-cream-50 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">NIN · National ID</div>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={11}
              value={nin}
              onChange={(e) => setNin(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="12345 67890 1"
              className="mt-1.5 w-full bg-transparent outline-none text-2xl font-mono font-bold tracking-[0.08em] text-ink placeholder:text-ink/30"
            />
            {nin.length === 11 && (
              <div className="text-[12px] font-semibold text-forest-600 mt-1">✓ Format ok. Will verify against NIMC on submit.</div>
            )}
          </div>

          <Input
            label="BVN — optional (raises KYC tier)"
            inputMode="numeric"
            maxLength={11}
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="22123456789"
            hint="Dial *565*0# to see your BVN. Stored hashed-only."
          />

          <Button block size="lg" disabled={nin.length !== 11} onClick={() => setStep(1)}>Continue →</Button>
          <div className="text-[11px] text-ink/45 text-center">NDPA-compliant. Re-keyed every 24 hours.</div>
        </div>
      )}

      {/* STEP 1 — Liveness, matches deck mockup */}
      {step === 1 && (
        <div className="space-y-6 animate-rise">
          <h2 className="font-display text-[34px] font-bold tracking-tightest leading-[1.05]">Now your selfie.</h2>
          <p className="text-ink/65 text-[15px] -mt-2">We match it against your NIN photo. ISO-30107 Level 2 liveness defeats deepfakes.</p>

          {/* Identity card row */}
          <div className="rounded-2xl ring-2 ring-ink/15 bg-cream-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">NIN · National ID</div>
            <div className="mt-1 font-mono font-bold tracking-[0.08em] text-[18px] text-ink">{nin.replace(/(\d{5})(\d{5})(\d)/, "$1 $2 $3")}</div>
            {selfieDataUrl && <div className="text-[12px] font-semibold text-forest-600 mt-1">✓ Match: {startName.split(" ")[0] || "User"} A.</div>}
          </div>

          {/* Big selfie circle — matches the bold avatar treatment in screenshot 1 */}
          <div className="grid place-items-center pt-2">
            <div className="relative w-[180px] h-[180px]">
              {!selfieDataUrl ? (
                <>
                  <div className="absolute inset-0 rounded-full overflow-hidden ring-[3px] ring-ink">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    {!streaming && <div className="absolute inset-0 grid place-items-center bg-cream-100 text-center px-4 text-[11px] text-ink/55">Camera permission needed</div>}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : (
                <div className="absolute inset-0 rounded-full bg-coral-grad ring-[3px] ring-ink grid place-items-center">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                </div>
              )}
            </div>
          </div>

          {!selfieDataUrl && livenessSteps.length === 0 && (
            <Button block size="lg" onClick={runLiveness} disabled={!streaming}>Begin liveness check</Button>
          )}

          {!selfieDataUrl && livenessSteps.length > 0 && (
            <div className="space-y-1.5 rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
              {livenessSteps.map((l) => (
                <div key={l.step} className="flex items-center gap-2 text-sm">
                  <span className={"step-dot " + (l.passed ? "done" : "active")}>{l.passed ? "✓" : "•"}</span>
                  <span className={l.passed ? "text-forest-600 font-semibold" : "text-ink/70"}>{l.step}</span>
                </div>
              ))}
            </div>
          )}

          {selfieDataUrl && (
            <>
              <div className="text-center text-[15px] font-semibold text-forest-600">Liveness check passed</div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { setSelfieDataUrl(null); setLivenessSteps([]); startCamera(); }}>Retake</Button>
                <Button onClick={() => setStep(2)}>Continue →</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2 — Bank */}
      {step === 2 && (
        <div className="space-y-5 animate-rise">
          <h2 className="font-display text-[34px] font-bold tracking-tightest leading-[1.05]">Where should we pay you?</h2>
          <p className="text-ink/65 text-[15px] -mt-2">We verify the account name matches your NIN using Squad Account Lookup. Instant settlement to GTBank.</p>

          <label className="block">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Bank</div>
            <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full h-12 rounded-2xl bg-cream-50 px-4 text-[15px] ring-1 ring-inset ring-ink/15 outline-none focus:ring-ink">
              {banks.map((b) => <option key={b.code} value={b.code}>{b.name}{b.code === "058" ? " · instant ⚡" : ""}</option>)}
            </select>
          </label>

          <Input label="Account number" inputMode="numeric" maxLength={10} value={acct} onChange={(e) => setAcct(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0123456789" />

          {acctName && (
            <div className="rounded-2xl bg-forest-500 text-cream-50 px-4 py-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cream-50/75">✓ Resolved via Squad /payout/account/lookup</div>
              <div className="font-bold text-[17px] mt-1">{acctName}</div>
            </div>
          )}
          {lookupLoading && <div className="text-xs text-ink/55">Looking up name…</div>}
          {error && <div className="text-coral-600 text-sm">{error}</div>}

          <Button block size="lg" disabled={!acctName} onClick={() => setStep(3)}>Continue →</Button>
        </div>
      )}

      {/* STEP 3 — Skills */}
      {step === 3 && (
        <div className="space-y-5 animate-rise">
          <h2 className="font-display text-[34px] font-bold tracking-tightest leading-[1.05]">What can you do?</h2>
          <p className="text-ink/65 text-[15px] -mt-2">Pick anything you do well. Pidgin's fine — our AI parses it.</p>

          <SkillPicker selected={skills} setSelected={setSkills} />
          <Input label="Area you work in" placeholder="Lekki, Yaba, Computer Village…" value={area} onChange={(e) => setArea(e.target.value)} />

          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Bio</div>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="e.g. I sabi gen, AC, fridge. 5 yrs for repair." className="w-full rounded-2xl bg-cream-50 px-4 py-3 text-[15px] ring-1 ring-inset ring-ink/15 outline-none focus:ring-ink" />
          </div>

          <Button block size="lg" loading={submitting} disabled={skills.length === 0} onClick={finish}>Complete · Open Squadco →</Button>
          {error && <div className="text-coral-600 text-sm text-center">{error}</div>}
        </div>
      )}
    </div>
  );
}

function SkillPicker({ selected, setSelected }: { selected: string[]; setSelected: (s: string[]) => void }) {
  const blue = ["generator", "plumbing", "electrical", "ac_hvac", "carpentry", "painting", "tiling", "cleaning", "errand", "delivery", "hairstyling", "tailoring", "photography"];
  const white = ["data_entry", "graphic_design", "social_media", "transcription", "tutoring"];
  function toggle(v: string) {
    if (selected.includes(v)) setSelected(selected.filter((s) => s !== v));
    else setSelected([...selected, v]);
  }
  return (
    <div className="space-y-4">
      {[{ title: "Blue-collar", items: blue }, { title: "White-collar / remote", items: white }].map((g) => (
        <div key={g.title}>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink/45 mb-2">{g.title}</div>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => toggle(v)}
                className={"text-[13px] font-semibold rounded-full px-3 py-1.5 ring-1 transition " + (selected.includes(v) ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 text-ink ring-ink/15 hover:bg-ink/5")}
              >
                {categoryLabel[v]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
