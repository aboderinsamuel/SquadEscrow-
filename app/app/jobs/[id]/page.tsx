import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { JobDetail } from "./JobDetail";

export default function JobPage({ params, searchParams }: { params: { id: string }; searchParams: { fund?: string } }) {
  const me = getSessionUser();
  if (!me) redirect("/auth");
  const db = readDB();
  const job = db.jobs.find((j) => j.id === params.id);
  if (!job) notFound();

  const customer = db.users.find((u) => u.id === job.customer_id);
  const worker = job.worker_id ? db.users.find((u) => u.id === job.worker_id) : undefined;
  const apps = db.applications.filter((a) => a.job_id === job.id);
  const enriched = apps.map((a) => ({ ...a, worker: db.users.find((u) => u.id === a.worker_id) })).filter((a) => a.worker);

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
