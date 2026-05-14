import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutate, readDB, id } from "@/lib/db";
import { createDynamicVA } from "@/lib/squad";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { job_id } = await req.json();
  const db = readDB();
  const job = db.jobs.find((j) => j.id === job_id);
  if (!job) return NextResponse.json({ ok: false, error: "no_job" }, { status: 404 });
  if (job.customer_id !== me.id) return NextResponse.json({ ok: false, error: "not_owner" }, { status: 403 });
  if (job.escrow_va) return NextResponse.json({ ok: true, va: job.escrow_va, ref: job.escrow_ref, source: "stored" });

  const r = await createDynamicVA({ jobId: job.id, amountNaira: job.amount, customerName: me.name || "Customer" });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error || "squad_failed" }, { status: 502 });

  mutate((db) => {
    const j = db.jobs.find((x) => x.id === job.id);
    if (j) { j.escrow_va = r.va; j.escrow_ref = r.ref; }
  });

  return NextResponse.json({ ok: true, va: r.va, ref: r.ref, source: r.source });
}
