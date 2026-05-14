import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const db = readDB();
  const job = db.jobs.find((j) => j.id === params.id);
  if (!job) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const worker = job.worker_id ? db.users.find((u) => u.id === job.worker_id) : null;
  const apps = db.applications.filter((a) => a.job_id === job.id);
  const enriched = apps.map((a) => ({ ...a, worker: db.users.find((u) => u.id === a.worker_id) })).filter((a) => a.worker);
  return NextResponse.json({ ok: true, job, worker, applications: enriched });
}
