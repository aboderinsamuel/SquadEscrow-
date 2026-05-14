import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutate, readDB, id } from "@/lib/db";
import { createDynamicVA, createBusinessVA, merchantId } from "@/lib/squad";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { job_id } = await req.json();
  const db = readDB();
  const job = db.jobs.find((j) => j.id === job_id);
  if (!job) return NextResponse.json({ ok: false, error: "no_job" }, { status: 404 });
  if (job.customer_id !== me.id) return NextResponse.json({ ok: false, error: "not_owner" }, { status: 403 });
  if (job.escrow_va) return NextResponse.json({ ok: true, va: job.escrow_va, ref: job.escrow_ref, source: "stored" });

  // Preferred path: Squad Dynamic VA — one NUBAN per job. Falls through to the
  // static Business VA below when the merchant doesn't have the dynamic-VA
  // entitlement enabled yet (sandbox returns 200 + empty data in that case).
  const ref = `${merchantId}-${job.id}`;
  const dyn = await createDynamicVA({ jobId: job.id, amountNaira: job.amount, customerName: me.name || "Customer" });
  let nuban: string | null = null;
  let source: string = dyn.source;

  if (dyn.ok && dyn.va && dyn.va !== "0000000000") {
    nuban = dyn.va;
  } else {
    // Static Business VA fallback — one permanent NUBAN per customer, customers
    // pay with the transaction_ref as their NIP narration.
    const biz = await createBusinessVA({
      customerIdentifier: me.id,
      businessName: (me.name || "Squadco Customer").slice(0, 60),
      mobileNum: me.phone || "08000000000",
      bvn: me.bvn_hash ? "22222222222" : "22222222222", // KYC tier-2 hash placeholder
      beneficiaryAccount: me.account_number || "0000000000",
      email: undefined,
    });
    if (biz.ok) {
      nuban = biz.va;
      source = biz.source + "-business-va";
    } else {
      return NextResponse.json({ ok: false, error: biz.error || dyn.error || "squad_failed" }, { status: 502 });
    }
  }

  mutate((db) => {
    const j = db.jobs.find((x) => x.id === job.id);
    if (j) { j.escrow_va = nuban!; j.escrow_ref = ref; }
  });

  return NextResponse.json({ ok: true, va: nuban, ref, source });
}
