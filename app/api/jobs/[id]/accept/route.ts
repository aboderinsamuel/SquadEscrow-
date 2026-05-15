import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
<<<<<<< HEAD
import { mutate } from "@/lib/db";
=======
import { mutateAndPersist } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { application_id } = await req.json();

  let err: string | null = null;
<<<<<<< HEAD
  mutate((db) => {
=======
  await mutateAndPersist((db) => {
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
    const job = db.jobs.find((j) => j.id === params.id);
    if (!job) { err = "no_job"; return; }
    if (job.customer_id !== me.id) { err = "not_owner"; return; }
    if (job.state !== "FUNDED") { err = "must_be_funded"; return; }
    const app = db.applications.find((a) => a.id === application_id && a.job_id === job.id);
    if (!app) { err = "no_app"; return; }
    db.applications
      .filter((a) => a.job_id === job.id && a.id !== application_id)
      .forEach((a) => { if (a.status === "pending") a.status = "rejected"; });
    app.status = "accepted";
    job.worker_id = app.worker_id;
    job.offer_amount = app.offer_amount;
    job.state = "ASSIGNED";
    job.assigned_at = Date.now();
  });

  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
  return NextResponse.json({ ok: true });
}
