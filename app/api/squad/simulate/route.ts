import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { signMockWebhook } from "@/lib/squad";

// Demo helper: posts a fake `charge_successful` webhook back to our own handler.
export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { job_id } = await req.json();
  const db = readDB();
  const job = db.jobs.find((j) => j.id === job_id);
  if (!job) return NextResponse.json({ ok: false, error: "no_job" }, { status: 404 });
  if (!job.escrow_ref) return NextResponse.json({ ok: false, error: "no_va" }, { status: 400 });

  const gatewayRef = "SQ_GW_" + Math.random().toString(36).slice(2, 14).toUpperCase();
  const body = JSON.stringify({
    Event: "charge_successful",
    TransactionRef: job.escrow_ref,
    TransactionAmount: job.amount * 100,
    TransactionCurrency: "NGN",
    GatewayTransactionRef: gatewayRef,
    Body: {
      TransactionRef: job.escrow_ref,
      GatewayTransactionRef: gatewayRef,
      source: "simulator",
    },
  });
  const sig = signMockWebhook(body);

  // Fire to our own webhook receiver
  const url = new URL(req.url);
  const target = `${url.protocol}//${url.host}/api/squad/webhook`;
  await fetch(target, { method: "POST", headers: { "content-type": "application/json", "x-squad-signature": sig }, body });

  return NextResponse.json({ ok: true });
}
