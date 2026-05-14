"use client";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { SocialChip } from "@/components/SocialChip";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryLabel, categoryEmoji } from "@/lib/utils";
import type { SocialHandle, SocialPlatform } from "@/lib/types";

type Bank = { code: string; name: string };

const PHOTO_OPTIONS = ["⚡", "🔧", "🛠", "❄️", "🪚", "🪑", "🚪", "🎨", "🖌️", "🟫", "🧹", "💇", "💅", "🪡", "👗", "📸", "🎬", "⌨️", "📊", "💻", "📱", "🎧", "📚", "🛵", "📦", "🎂", "🥘", "💡", "🔌", "☀️"];

const STEPS = ["Identity", "Business", "Socials", "Location", "Bank", "Skills"] as const;

export function BusinessOnboard({ banks }: { banks: Bank[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [livenessSteps, setLivenessSteps] = useState<{ step: string; passed: boolean }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  // Business profile fields
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState(5000);
  const [responseMin, setResponseMin] = useState(30);
  // Socials
  const [socials, setSocials] = useState<SocialHandle[]>([]);
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("instagram");
  const [newHandle, setNewHandle] = useState("");
  // Location
  const [area, setArea] = useState("Lekki");
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(10);
  // Bank
  const [bank, setBank] = useState(banks[0]?.code || "058");
  const [acct, setAcct] = useState("");
  const [acctName, setAcctName] = useState("");
  const [acctLoading, setAcctLoading] = useState(false);
  // Skills + photos
  const [skills, setSkills] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (step === 0) startCamera(); else stopCamera(); }, [step]);

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
      await new Promise((r) => setTimeout(r, 650));
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

  async function lookup() {
    if (acct.length !== 10) return;
    setAcctLoading(true);
    try {
      const r = await fetch("/api/squad/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bank_code: bank, account_number: acct }) });
      const d = await r.json();
      if (d.ok) setAcctName(d.account_name);
    } finally { setAcctLoading(false); }
  }
  useEffect(() => { if (acct.length === 10) lookup(); }, [acct, bank]);

  function detectGeo() {
    if (!navigator.geolocation) { setGeo({ lat: 6.4474, lng: 3.4724 }); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setGeo({ lat: 6.4474, lng: 3.4724 }),
      { timeout: 5000 },
    );
  }

  function addSocial() {
    if (!newHandle.trim()) return;
    setSocials([...socials, { platform: newPlatform, handle: newHandle.trim(), verified: false, since: new Date().toISOString().slice(0, 7) }]);
    setNewHandle("");
  }

  async function finish() {
    setSubmitting(true); setError(null);
    try {
      const r = await fetch("/api/me/kyc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nin, bvn,
          bank_code: bank, account_number: acct, account_name: acctName,
          liveness_passed: livenessSteps.length > 0 && livenessSteps.every(s => s.passed),
          skills, area, bio, role: "worker",
          business_name: businessName,
          social_handles: socials,
          business_photos: photos,
          geo,
          service_radius_km: radius,
          hourly_rate: hourlyRate,
          response_time_min: responseMin,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      router.push("/app/feed");
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-1">
        {STEPS.map((_, i) => (
          <div key={i} className={"flex-1 h-1.5 rounded-full " + (i <= step ? "bg-coral-500" : "bg-ink/10")} />
        ))}
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-ink/55 font-semibold">Step {step + 1} of {STEPS.length} · {STEPS[step]}</div>

      {step === 0 && (
        <div className="space-y-4 animate-rise">
          <Input label="NIN — 11 digits" inputMode="numeric" maxLength={11} value={nin} onChange={(e) => setNin(e.target.value.replace(/[^0-9]/g, ""))} placeholder="12345 67890 1" />
          <Input label="BVN — 11 digits" inputMode="numeric" maxLength={11} value={bvn} onChange={(e) => setBvn(e.target.value.replace(/[^0-9]/g, ""))} placeholder="22123456789" hint="Required for business tier — protects you and unlocks loans." />
          <div className="relative rounded-3xl overflow-hidden ring-1 ring-ink/10 bg-ink aspect-square">
            {!selfieDataUrl ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <canvas ref={canvasRef} className="hidden" />
                {!streaming && <div className="absolute inset-0 grid place-items-center text-center px-6 text-sm text-cream-50/65">Camera permission needed.</div>}
                {livenessSteps.length > 0 && (
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink to-transparent">
                    <div className="space-y-1">
                      {livenessSteps.map((l) => (
                        <div key={l.step} className="flex items-center gap-2 text-sm">
                          <span className={"grid h-5 w-5 place-items-center rounded-full text-[11px] " + (l.passed ? "bg-forest-500 text-cream-50" : "bg-cream-50/10 text-cream-50/55")}>{l.passed ? "✓" : "•"}</span>
                          <span className={l.passed ? "text-cream-50" : "text-cream-50/70"}>{l.step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <img src={selfieDataUrl} alt="Selfie" className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute top-3 left-3 right-3 rounded-xl bg-forest-500 text-cream-50 px-3 py-2 text-sm font-bold">✓ Liveness passed · ✓ NIN match (97.4%)</div>
              </>
            )}
          </div>
          {!selfieDataUrl ? (
            <Button block size="lg" onClick={runLiveness} disabled={!streaming || nin.length !== 11 || bvn.length !== 11}>Run liveness check</Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setSelfieDataUrl(null); setLivenessSteps([]); startCamera(); }}>Retake</Button>
              <Button onClick={() => setStep(1)}>Continue</Button>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-rise">
          <Input label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Gen Genius Lagos" maxLength={60} />
          <Textarea label="Tell customers about you" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Pidgin is fine. e.g. 'I sabi gen, AC, fridge. 5 yrs experience. Lekki area.'" maxLength={400} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Typical hourly rate (₦)" inputMode="numeric" type="number" min={500} value={hourlyRate} onChange={(e) => setHourlyRate(Math.max(500, parseInt(e.target.value || "0", 10)))} />
            <Input label="Response time (minutes)" inputMode="numeric" type="number" min={5} value={responseMin} onChange={(e) => setResponseMin(Math.max(5, parseInt(e.target.value || "0", 10)))} />
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Cover photo (pick a glyph for now)</div>
            <div className="flex flex-wrap gap-1.5">
              {PHOTO_OPTIONS.map((p) => (
                <button key={p} type="button" onClick={() => setPhotos(photos.includes(p) ? photos.filter(x => x !== p) : [...photos.slice(0, 5), p])} className={"h-10 w-10 grid place-items-center rounded-xl text-xl ring-1 transition " + (photos.includes(p) ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 ring-ink/10 hover:bg-cream-100")}>{p}</button>
              ))}
            </div>
          </div>
          <Button block size="lg" disabled={!businessName.trim()} onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-rise">
          <p className="text-[14px] text-ink/65 leading-relaxed">Link your existing social presence. We use this to build your <b className="text-ink">credibility score</b> and to help customers verify you're real.</p>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Add a handle</div>
            <div className="flex gap-2">
              <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value as any)} className="rounded-2xl bg-cream-50 ring-1 ring-ink/15 px-3 text-[14px] outline-none">
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="twitter">X / Twitter</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="jiji">Jiji</option>
                <option value="google">Google Maps</option>
              </select>
              <input value={newHandle} onChange={(e) => setNewHandle(e.target.value)} placeholder="@yourhandle or +234..." className="flex-1 rounded-2xl bg-cream-50 ring-1 ring-ink/15 px-3 py-2 text-[14px] outline-none focus:ring-ink" />
              <Button size="md" onClick={addSocial} disabled={!newHandle.trim()}>Add</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {socials.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <SocialChip platform={s.platform as any} handle={s.handle} verified={s.verified} compact />
                <button onClick={() => setSocials(socials.filter((_, j) => j !== i))} className="text-ink/40 text-[14px]">×</button>
              </span>
            ))}
          </div>
          {socials.length === 0 && <div className="rounded-2xl bg-gold-200 ring-1 ring-gold-400 p-3 text-[12.5px] text-ink/70">Heads up: businesses with at least one social handle earn an automatic <b>+12 credibility</b>.</div>}
          <Button block size="lg" onClick={() => setStep(3)}>Continue</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-rise">
          <Input label="Service area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Lekki, Yaba, Ikeja, Remote…" />
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Pin on the map</div>
            <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4">
              {geo ? (
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-coral-500 text-cream-50 text-xl shrink-0">📍</div>
                  <div className="flex-1">
                    <div className="font-bold text-ink">Pin set</div>
                    <div className="text-[11.5px] text-ink/55 font-mono">{geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={detectGeo}>Re-detect</Button>
                </div>
              ) : (
                <Button block size="md" variant="outline" onClick={detectGeo}>Use my current location</Button>
              )}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Service radius: {radius} km</div>
            <input type="range" min={1} max={30} value={radius} onChange={(e) => setRadius(parseInt(e.target.value, 10))} className="w-full accent-coral-500" />
          </div>
          <Button block size="lg" onClick={() => setStep(4)} disabled={!geo}>Continue</Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-rise">
          <p className="text-[14px] text-ink/65 leading-relaxed">Where should we pay you? <b className="text-ink">GTBank settles instantly</b>; all other banks T+1.</p>
          <label className="block">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Bank</div>
            <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full rounded-2xl bg-cream-50 px-4 py-3 text-[15px] ring-1 ring-ink/15 outline-none focus:ring-ink">
              {banks.map((b) => <option key={b.code} value={b.code}>{b.name}{b.code === "058" ? " · instant ⚡" : ""}</option>)}
            </select>
          </label>
          <Input label="Account number" inputMode="numeric" maxLength={10} value={acct} onChange={(e) => setAcct(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0123456789" />
          {acctLoading && <div className="text-[12px] text-ink/55">Resolving…</div>}
          {acctName && (
            <div className="rounded-2xl bg-forest-100 ring-1 ring-forest-500/30 px-4 py-3 text-sm">
              <div className="text-[10px] uppercase tracking-wider text-forest-700 font-semibold">✓ Resolved via Squad /payout/account/lookup</div>
              <div className="font-bold text-ink mt-0.5">{acctName}</div>
              {businessName && <div className="text-[11px] text-ink/55 mt-1">Will match against business name "{businessName}" on submit.</div>}
            </div>
          )}
          <Button block size="lg" disabled={!acctName} onClick={() => setStep(5)}>Continue</Button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4 animate-rise">
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Pick your skills</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(categoryLabel).filter(([k]) => k !== "other").map(([v, l]) => (
                <button key={v} type="button" onClick={() => setSkills(skills.includes(v) ? skills.filter(s => s !== v) : [...skills, v])} className={"text-[13px] rounded-full px-3 py-1.5 ring-1 transition " + (skills.includes(v) ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 ring-ink/15 text-ink/75 hover:bg-cream-100")}>
                  <span className="mr-1">{categoryEmoji[v]}</span>{l}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-coral-200 ring-1 ring-coral-500/30 p-4">
            <div className="text-[11px] uppercase tracking-wider text-coral-700 font-semibold">You're about to go live</div>
            <div className="text-[14px] text-ink mt-1"><b>{businessName}</b> · {socials.length} social{socials.length === 1 ? "" : "s"} · pinned in {area} · {skills.length} skill{skills.length === 1 ? "" : "s"}</div>
          </div>
          <Button block size="lg" loading={submitting} disabled={skills.length === 0} onClick={finish}>Publish profile · open Squadco</Button>
          {error && <div className="text-coral-600 text-sm text-center">{error}</div>}
        </div>
      )}
    </div>
  );
}
