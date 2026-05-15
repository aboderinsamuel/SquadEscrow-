import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { mutate, readDB, id } from "@/lib/db";
=======
import { mutateAndPersist, id } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
import { verifyWebhookSignature } from "@/lib/squad";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-squad-signature");
  const ok = verifyWebhookSignature(raw, sig);

  let payload: any = null;
  try { payload = JSON.parse(raw); } catch { payload = {}; }

<<<<<<< HEAD
  mutate((db) => {
=======
  await mutateAndPersist((db) => {
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
    db.webhooks.push({
      id: id("wh"),
      event_type: payload?.Event || payload?.event || "unknown",
      signature: sig || "",
      raw_body: raw.slice(0, 4000),
      payload: payload || {},
      verified: ok,
      processed_at: Date.now(),
    });
  });

  if (!ok) return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });

  const event = (payload?.Event || payload?.event || "").toString();
  if (event === "charge_successful" || event === "successful_transaction") {
    const ref = payload?.TransactionRef || payload?.transaction_ref || payload?.Body?.TransactionRef;
    const amountKobo = Number(payload?.TransactionAmount || payload?.transaction_amount || 0);
    const amountNaira = Math.round(amountKobo / 100);
<<<<<<< HEAD
    if (ref) markJobFunded(ref, amountNaira, payload);
=======
    if (ref) await markJobFunded(ref, amountNaira, payload);
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
  }

  return NextResponse.json({ ok: true });
}

<<<<<<< HEAD
function markJobFunded(ref: string, amountNaira: number, payload: any) {
  mutate((db) => {
=======
async function markJobFunded(ref: string, amountNaira: number, payload: any) {
  await mutateAndPersist((db) => {
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
    const job = db.jobs.find((j) => j.escrow_ref === ref);
    if (!job) return;
    if (job.state !== "POSTED") return;
    job.state = "FUNDED";
    job.funded_at = Date.now();
    db.transactions.push({
      id: id("tx"),
      job_id: job.id,
      user_id: job.customer_id,
      type: "escrow_in",
      channel: "va",
      squad_ref: ref,
      amount: amountNaira || job.amount,
      fee: Math.min(Math.round((amountNaira || job.amount) * 0.0025), 1000),
      status: "success",
      payload,
      created_at: Date.now(),
    });
  });
}
