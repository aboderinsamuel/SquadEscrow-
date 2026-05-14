import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutate, readDB, id } from "@/lib/db";
import { refundTransaction, vaFee } from "@/lib/squad";

// Refund the customer when a job is disputed and resolves in the customer's
// favour (or is cancelled after funding). Calls Squad /transaction/refund.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });

  const db = readDB();
  const job = db.jobs.find((j) => j.id === params.id);
  if (!job) return NextResponse.json({ ok: false, error: "no_job" }, { status: 404 });
  if (job.customer_id !== me.id) return NextResponse.json({ ok: false, error: "not_owner" }, { status: 403 });
  if (job.state !== "DISPUTED" && job.state !== "FUNDED") {
    return NextResponse.json({ ok: false, error: "not_refundable", note: "Refunds allowed from FUNDED or DISPUTED state" }, { status: 400 });
  }

  // Squad's refund requires both your transaction_ref and the gateway ref it
  // assigned when the charge succeeded. Pull the gateway ref off the stored
  // webhook payload; fall back to the escrow ref so mock-mode demos still work.
  const escrowTx = db.transactions.find((t) => t.job_id === job.id && t.type === "escrow_in");
  const payload = (escrowTx?.payload || {}) as any;
  const gatewayRef =
    payload?.gateway_transaction_ref ||
    payload?.Body?.GatewayTransactionRef ||
    payload?.GatewayTransactionRef ||
    payload?.Body?.gateway_transaction_ref ||
    job.escrow_ref ||
    "";

  if (!job.escrow_ref || !gatewayRef) {
    return NextResponse.json({ ok: false, error: "no_escrow_ref" }, { status: 400 });
  }

  const amount = job.offer_amount || job.amount;
  const r = await refundTransaction({
    transactionRef: job.escrow_ref,
    gatewayTransactionRef: gatewayRef,
    amountNaira: amount,
    reason: "Customer dispute resolved in customer's favour",
  });

  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error || "refund_failed", source: r.source }, { status: 502 });
  }

  mutate((db) => {
    const j = db.jobs.find((x) => x.id === job.id);
    if (!j) return;
    j.state = "CANCELLED";
    j.settled_at = Date.now();
    db.transactions.push({
      id: id("tx"),
      job_id: j.id,
      user_id: me.id,
      type: "refund",
      channel: "transfer",
      squad_ref: job.escrow_ref!,
      amount,
      fee: vaFee(amount),
      status: "success",
      payload: { source: r.source, gateway_ref: gatewayRef },
      created_at: Date.now(),
    });
  });

  return NextResponse.json({ ok: true, amount, source: r.source });
}
