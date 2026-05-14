import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutate, readDB, id } from "@/lib/db";
import { transferPayout, transferFee } from "@/lib/squad";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });

  const db = readDB();
  const job = db.jobs.find((j) => j.id === params.id);
  if (!job) return NextResponse.json({ ok: false, error: "no_job" }, { status: 404 });
  if (job.customer_id !== me.id) return NextResponse.json({ ok: false, error: "not_owner" }, { status: 403 });
  // Allow release from WORKER_COMPLETED (normal happy path) or from DISPUTED
  // (when the dispute resolves in the worker's favour).
  if (job.state !== "WORKER_COMPLETED" && job.state !== "DISPUTED") {
    return NextResponse.json({ ok: false, error: "not_completed" }, { status: 400 });
  }
  if (!job.worker_id) return NextResponse.json({ ok: false, error: "no_worker" }, { status: 400 });

  const worker = db.users.find((u) => u.id === job.worker_id);
  if (!worker || !worker.bank_code || !worker.account_number || !worker.account_name) {
    return NextResponse.json({ ok: false, error: "worker_bank_missing" }, { status: 400 });
  }

  const amount = job.offer_amount || job.amount;
  const platformFee = Math.round(amount * 0.07);
  const txFee = transferFee(amount);
  const net = amount - platformFee - txFee;

  const r = await transferPayout({
    jobId: job.id,
    amountNaira: net,
    bank_code: worker.bank_code,
    account_number: worker.account_number,
    account_name: worker.account_name,
    remark: `SQUADCO ${job.id}`,
  });

  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error || "transfer_failed" }, { status: 502 });
  }

  mutate((db) => {
    const j = db.jobs.find((x) => x.id === job.id);
    if (!j) return;
    j.state = "SETTLED";
    j.settled_at = Date.now();
    j.payout_ref = r.ref;
    db.transactions.push({
      id: id("tx"),
      job_id: j.id,
      user_id: worker.id,
      type: "payout_out",
      channel: "transfer",
      squad_ref: r.ref,
      amount: net,
      fee: txFee,
      status: "success",
      payload: { source: r.source },
      created_at: Date.now(),
    });
    db.transactions.push({
      id: id("tx2"),
      job_id: j.id,
      user_id: me.id,
      type: "fee",
      channel: "transfer",
      squad_ref: r.ref,
      amount: platformFee,
      fee: 0,
      status: "success",
      created_at: Date.now(),
    });
    const w = db.users.find((u) => u.id === worker.id);
    if (w) {
      w.jobs_completed += 1;
      w.on_time_rate = ((w.on_time_rate * (w.jobs_completed - 1)) + 1) / w.jobs_completed;
      w.avg_rating = Math.max(w.avg_rating, 4.5);
      w.jara_score = Math.min(850, (w.jara_score || 580) + 12);
    }
  });

  return NextResponse.json({ ok: true, payout_ref: r.ref, net });
}
