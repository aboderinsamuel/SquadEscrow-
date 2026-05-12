"use client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Bank = { code: string; name: string };

export function CustomerOnboard({ banks }: { banks: Bank[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nin, setNin] = useState("");
  const [bank, setBank] = useState(banks[0]?.code || "058");
  const [acct, setAcct] = useState("");
  const [acctName, setAcctName] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    if (acct.length !== 10) return;
    setLookupLoading(true);
    try {
      const r = await fetch("/api/squad/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bank_code: bank, account_number: acct }) });
      const d = await r.json();
      if (d.ok) setAcctName(d.account_name);
    } finally { setLookupLoading(false); }
  }
  useEffect(() => { if (acct.length === 10) lookup(); }, [acct, bank]);

  async function finish(includeBank: boolean) {
    setBusy(true); setError(null);
    try {
      const r = await fetch("/api/me/kyc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nin,
          bank_code: includeBank ? bank : undefined,
          account_number: includeBank ? acct : undefined,
          account_name: includeBank ? acctName : undefined,
          liveness_passed: true,
          skills: [],
          area: "",
          bio: "",
          role: "customer",
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      router.push("/app/feed");
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-1">
        {["NIN", "Bank (optional)"].map((s, i) => (
          <div key={s} className={"flex-1 h-1.5 rounded-full " + (i <= step ? "bg-coral-500" : "bg-ink/10")} />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-5 animate-rise">
          <Input
            label="NIN — 11 digits"
            inputMode="numeric"
            maxLength={11}
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="12345 67890 1"
            hint={nin.length === 11 ? "✓ Format ok. We'll verify against NIMC on submit." : "From your National ID card or USSD *346#"}
          />
          <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4 text-[12.5px] text-ink/65 leading-relaxed">
            <b className="text-ink">Why we ask:</b> NDPA-required identity check on customers protects workers from fake jobs and chargeback fraud. Hashed-only storage. Never shared.
          </div>
          <Button block size="lg" disabled={nin.length !== 11} onClick={() => setStep(1)}>Continue</Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5 animate-rise">
          <p className="text-[14px] text-ink/65 leading-relaxed">Add a bank account so we can <b className="text-ink">refund you instantly</b> if a job is cancelled. You can skip and add this later.</p>
          <label className="block">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Bank</div>
            <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full rounded-2xl bg-cream-50 px-4 py-3 text-[15px] text-ink ring-1 ring-ink/15 outline-none focus:ring-ink">
              {banks.map((b) => <option key={b.code} value={b.code}>{b.name}{b.code === "058" ? " · instant ⚡" : ""}</option>)}
            </select>
          </label>
          <Input label="Account number" inputMode="numeric" maxLength={10} value={acct} onChange={(e) => setAcct(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0123456789" />
          {lookupLoading && <div className="text-[12px] text-ink/55">Resolving via Squad…</div>}
          {acctName && (
            <div className="rounded-2xl bg-forest-100 ring-1 ring-forest-500/30 px-4 py-3 text-[14px]">
              <div className="text-[10px] uppercase tracking-wider text-forest-700 font-semibold">✓ Resolved via Squad /payout/account/lookup</div>
              <div className="font-bold text-ink mt-0.5">{acctName}</div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" block size="lg" loading={busy} onClick={() => finish(false)}>Skip for now</Button>
            <Button block size="lg" loading={busy} disabled={!acctName} onClick={() => finish(true)}>Save & continue</Button>
          </div>
          {error && <div className="text-coral-600 text-sm text-center">{error}</div>}
        </div>
      )}
    </div>
  );
}
