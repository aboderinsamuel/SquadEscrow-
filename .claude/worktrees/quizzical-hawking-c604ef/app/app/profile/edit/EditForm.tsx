"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/Input";
import { Button } from "@/components/Button";
import { categoryLabel } from "@/lib/utils";

const SKILL_OPTIONS = Object.keys(categoryLabel).filter((k) => k !== "other");

export function EditForm({ initial }: {
  initial: {
    name: string;
    area: string;
    bio: string;
    skills: string[];
    hourly_rate: number | null;
    business_name: string;
    is_business: boolean;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [area, setArea] = useState(initial.area);
  const [bio, setBio] = useState(initial.bio);
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [hourlyRate, setHourlyRate] = useState<string>(initial.hourly_rate != null ? String(initial.hourly_rate) : "");
  const [businessName, setBusinessName] = useState(initial.business_name);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function toggleSkill(s: string) {
    setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 12));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        area: area.trim(),
        bio,
        skills,
        hourly_rate: hourlyRate ? Number(hourlyRate) : undefined,
        business_name: initial.is_business ? businessName.trim() : undefined,
      }),
    });
    setBusy(false);
    if (r.ok) {
      setMsg("Saved.");
      router.refresh();
      setTimeout(() => router.push("/app/profile"), 600);
    } else {
      setMsg("Could not save. Try again.");
    }
  }

  return (
    <div className="mt-5 space-y-4 pb-6">
      <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      {initial.is_business && (
        <Input
          label="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          hint="Shown to customers on Discover, Map, and Reels."
        />
      )}
      <Input
        label="Area"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        placeholder="e.g. Lekki, Surulere"
      />
      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell customers what you do, your experience, and coverage area."
        maxLength={400}
        hint={`${bio.length}/400`}
      />
      <Input
        label="Hourly rate (₦)"
        value={hourlyRate}
        type="number"
        inputMode="numeric"
        onChange={(e) => setHourlyRate(e.target.value)}
        placeholder="e.g. 5000"
      />

      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Skills</div>
        <div className="flex flex-wrap gap-1.5">
          {SKILL_OPTIONS.map((s) => {
            const active = skills.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={
                  "rounded-full px-3 py-1.5 text-[12.5px] font-semibold ring-1 transition " +
                  (active ? "bg-coral-500 text-cream-50 ring-coral-500" : "bg-cream-50 text-ink/70 ring-ink/15")
                }
              >
                {categoryLabel[s]}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 text-[12px] text-ink/50">{skills.length}/12 selected</div>
      </div>

      <div className="sticky bottom-[100px] pt-2">
        <Button block size="lg" onClick={save} loading={busy} disabled={busy}>
          Save changes
        </Button>
        {msg && <div className="mt-2 text-[12.5px] text-center text-ink/65">{msg}</div>}
      </div>
    </div>
  );
}
