import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
<<<<<<< HEAD
import { mutate } from "@/lib/db";
=======
import { mutateAndPersist } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293

// Demo-friendly claim: marks the discovered profile as claimed.
// In production this would: (1) verify NIN matches the social handle owner,
// (2) require account-name match against business name, (3) require a successful
// liveness check, (4) optionally absorb the scraped profile into the claimant's user.
export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { target_id } = await req.json();
  if (!target_id) return NextResponse.json({ ok: false, error: "missing_target" }, { status: 400 });
  let ok = false;
<<<<<<< HEAD
  mutate((db) => {
=======
  await mutateAndPersist((db) => {
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
    const t = db.users.find((u) => u.id === target_id);
    if (!t) return;
    if (t.source !== "discovered") return;
    t.source = "claimed";
    t.claimed = true;
    t.kyc_tier = Math.max(2, t.kyc_tier) as any;
    t.liveness_passed = true;
    t.jara_score = Math.max(620, t.jara_score);
    if (!t.fraud_signals) t.fraud_signals = {};
    t.fraud_signals.nin_matches_bvn = true;
    t.fraud_signals.last_check = Date.now();
    ok = true;
  });
  return NextResponse.json({ ok });
}
