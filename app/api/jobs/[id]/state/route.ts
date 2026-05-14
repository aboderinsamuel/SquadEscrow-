import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutateAndPersist } from "@/lib/db";
import type { JobState } from "@/lib/types";

const transitions: Record<JobState, JobState[]> = {
  POSTED: ["FUNDED", "CANCELLED"],
  FUNDED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WORKER_COMPLETED", "DISPUTED"],
  WORKER_COMPLETED: ["SETTLED", "DISPUTED"],
  SETTLED: [],
  DISPUTED: ["SETTLED", "CANCELLED"],
  CANCELLED: [],
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { state } = await req.json();

  let err: string | null = null;
  await mutateAndPersist((db) => {
    const job = db.jobs.find((j) => j.id === params.id);
    if (!job) { err = "no_job"; return; }
    if (job.customer_id !== me.id && job.worker_id !== me.id) { err = "not_participant"; return; }
    const allowed = transitions[job.state] || [];
    if (!allowed.includes(state)) { err = `cant_transition_${job.state}_to_${state}`; return; }
    // Role-specific guards
    if (state === "IN_PROGRESS" && job.worker_id !== me.id) { err = "only_worker_can_start"; return; }
    if (state === "WORKER_COMPLETED" && job.worker_id !== me.id) { err = "only_worker"; return; }
    job.state = state;
    if (state === "WORKER_COMPLETED") job.completed_at = Date.now();
  });

  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
  return NextResponse.json({ ok: true });
}
