"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

export function ClaimButton({ targetId, className }: { targetId: string; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function claim() {
    setBusy(true);
    const r = await fetch("/api/artisans/claim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target_id: targetId }) });
    const d = await r.json();
    setBusy(false);
    if (d.ok) router.refresh();
    else alert(d.error || "Could not claim");
  }
  return <Button onClick={claim} loading={busy} className={className} variant="dark">Claim this profile →</Button>;
}
