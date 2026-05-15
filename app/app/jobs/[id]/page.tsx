import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
<<<<<<< HEAD
import { readDB } from "@/lib/db";
=======
import { readDB, findJobById, findUserById } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
import { AppHeader } from "@/components/AppHeader";
import { JobDetail } from "./JobDetail";

export default async function JobPage({ params, searchParams }: { params: { id: string }; searchParams: { fund?: string } }) {
  const me = await getSessionUser();
  if (!me) redirect("/auth");
<<<<<<< HEAD
  const db = readDB();
  const job = db.jobs.find((j) => j.id === params.id);
  if (!job) notFound();

  const customer = db.users.find((u) => u.id === job.customer_id);
  const worker = job.worker_id ? db.users.find((u) => u.id === job.worker_id) : undefined;
  const apps = db.applications.filter((a) => a.job_id === job.id);
  const enriched = apps.map((a) => ({ ...a, worker: db.users.find((u) => u.id === a.worker_id) })).filter((a) => a.worker);
=======
  // Use the Supabase-fallback helper. Cache-only lookup 404s when the job
  // was just written by another lambda and this one hasn't seen it — which
  // is exactly what happens after "post job" hands you to /app/jobs/<id>?fund=1.
  const job = await findJobById(params.id);
  if (!job) notFound();

  const db = readDB();
  const customer = await findUserById(job.customer_id);
  const worker = job.worker_id ? await findUserById(job.worker_id) : undefined;
  const apps = db.applications.filter((a) => a.job_id === job.id);
  const enrichedRaw = await Promise.all(
    apps.map(async (a) => ({ ...a, worker: await findUserById(a.worker_id) })),
  );
  const enriched = enrichedRaw.filter((a) => a.worker);
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293

  return (
    <>
      <AppHeader title="Job" back />
      <JobDetail
        meId={me.id}
        meRole={me.role}
        job={job}
        customer={customer ? { id: customer.id, name: customer.name, area: customer.area, avg_rating: customer.avg_rating, kyc_tier: customer.kyc_tier } : null}
        worker={worker ? { id: worker.id, name: worker.name, area: worker.area, bio: worker.bio, skills: worker.skills, jara_score: worker.jara_score, avg_rating: worker.avg_rating, jobs_completed: worker.jobs_completed, on_time_rate: worker.on_time_rate, kyc_tier: worker.kyc_tier, bank_code: worker.bank_code, account_number: worker.account_number, account_name: worker.account_name } : null}
        applications={enriched as any}
        autoFund={searchParams.fund === "1"}
      />
    </>
  );
}
