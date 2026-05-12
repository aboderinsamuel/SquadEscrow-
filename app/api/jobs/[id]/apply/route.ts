import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutate, readDB, id } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  if (me.role === "customer") return NextResponse.json({ ok: false, error: "customer_role" }, { status: 403 });

  const { offer_amount, message } = await req.json();
  const db = readDB();
  const job = db.jobs.find((j) => j.id === params.id);
  if (!job) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (job.customer_id === me.id) return NextResponse.json({ ok: false, error: "cant_apply_own" }, { status: 400 });
  if (job.state !== "POSTED" && job.state !== "FUNDED") return NextResponse.json({ ok: false, error: "job_closed" }, { status: 400 });

  const existing = db.applications.find((a) => a.job_id === job.id && a.worker_id === me.id);
  if (existing) return NextResponse.json({ ok: false, error: "already_applied" }, { status: 400 });

  const appId = id("a");
  mutate((db) => {
    db.applications.push({
      id: appId,
      job_id: job.id,
      worker_id: me.id,
      offer_amount: Math.max(500, Math.round(offer_amount || job.amount)),
      message: String(message || "").slice(0, 400),
      status: "pending",
      created_at: Date.now(),
    });
  });

  return NextResponse.json({ ok: true, application_id: appId });
}
