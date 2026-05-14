"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { categoryLabel, naira, stateLabel, stateColor, timeAgo } from "@/lib/utils";

interface JobLite {
  id: string;
  title: string;
  category: string;
  amount: number;
  area: string;
  urgency: string;
  state: string;
  created_at: number;
  funded_at?: number;
  worker_id?: string;
  worker_name?: string;
  application_count?: number;
}

interface AppLite {
  id: string;
  job_id: string;
  offer_amount: number;
  message: string;
  status: string;
  created_at: number;
  job_title: string;
  job_state: string;
  job_amount: number;
  job_area: string;
  job_category: string;
}

type WorkerTab = "all" | "pending" | "accepted" | "rejected" | "active";
type CustomerTab = "all" | "open" | "active" | "completed" | "cancelled";

export function ProfileActivity({
  role,
  postedJobs,
  applications,
  assignedJobs,
}: {
  role: "worker" | "customer" | "both";
  postedJobs: JobLite[];
  applications: AppLite[];
  assignedJobs: JobLite[];
}) {
  const isWorker = role === "worker" || role === "both";
  const isCustomer = role === "customer" || role === "both";

  const [view, setView] = useState<"posted" | "applications" | "assigned">(
    isCustomer && postedJobs.length > 0 ? "posted" : isWorker ? "applications" : "posted",
  );

  return (
    <section className="mt-7">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">My activity</div>
        <Link href="/app/profile/edit" className="text-[12px] font-semibold text-coral-500 hover:text-coral-600">Edit profile</Link>
      </div>

      {/* Top tab switcher between buckets */}
      <div className="flex items-center gap-1.5 overflow-x-auto -mx-5 px-5 pb-2 mb-3">
        {isCustomer && (
          <ViewTab active={view === "posted"} onClick={() => setView("posted")}>
            Posted jobs · {postedJobs.length}
          </ViewTab>
        )}
        {isWorker && (
          <ViewTab active={view === "applications"} onClick={() => setView("applications")}>
            My applications · {applications.length}
          </ViewTab>
        )}
        {isWorker && (
          <ViewTab active={view === "assigned"} onClick={() => setView("assigned")}>
            Active jobs · {assignedJobs.length}
          </ViewTab>
        )}
      </div>

      {view === "posted" && <PostedJobs jobs={postedJobs} />}
      {view === "applications" && <MyApplications apps={applications} />}
      {view === "assigned" && <AssignedJobs jobs={assignedJobs} />}
    </section>
  );
}

function ViewTab({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold ring-1 transition " +
        (active ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 text-ink/70 ring-ink/10 hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function PostedJobs({ jobs }: { jobs: JobLite[] }) {
  const [tab, setTab] = useState<CustomerTab>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return jobs;
    if (tab === "open") return jobs.filter((j) => j.state === "POSTED" || j.state === "FUNDED");
    if (tab === "active") return jobs.filter((j) => ["ASSIGNED", "IN_PROGRESS", "WORKER_COMPLETED"].includes(j.state));
    if (tab === "completed") return jobs.filter((j) => j.state === "SETTLED");
    return jobs.filter((j) => j.state === "CANCELLED" || j.state === "DISPUTED");
  }, [jobs, tab]);

  return (
    <>
      <div className="flex items-center gap-1.5 overflow-x-auto -mx-5 px-5 pb-2 mb-3">
        <FilterChip active={tab === "all"} onClick={() => setTab("all")}>All</FilterChip>
        <FilterChip active={tab === "open"} onClick={() => setTab("open")}>Open</FilterChip>
        <FilterChip active={tab === "active"} onClick={() => setTab("active")}>Active</FilterChip>
        <FilterChip active={tab === "completed"} onClick={() => setTab("completed")}>Completed</FilterChip>
        <FilterChip active={tab === "cancelled"} onClick={() => setTab("cancelled")}>Cancelled / Disputed</FilterChip>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={tab === "all" ? "You haven't posted any jobs yet." : "Nothing matches this filter."}
          cta={tab === "all" ? { href: "/app/post", label: "Post your first job" } : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((j) => <PostedJobRow key={j.id} job={j} />)}
        </div>
      )}
    </>
  );
}

function PostedJobRow({ job }: { job: JobLite }) {
  return (
    <Link href={`/app/jobs/${job.id}`} className="block rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4 hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-semibold tracking-tight leading-tight truncate">{job.title}</div>
          <div className="text-[12px] text-ink/55 mt-1">
            <span>{categoryLabel[job.category] || job.category}</span>
            <span className="mx-1.5 opacity-50">·</span>
            <span>{job.area}</span>
            <span className="mx-1.5 opacity-50">·</span>
            <span>{timeAgo(job.created_at)}</span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-ink text-cream-50 px-2.5 py-1 text-[12px] font-bold">{naira(job.amount)}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px]">
        <span className={"rounded-full ring-1 px-2 py-0.5 font-semibold uppercase tracking-wider " + stateColor(job.state)}>
          {stateLabel(job.state)}
        </span>
        <div className="flex items-center gap-2 text-ink/55">
          {job.application_count !== undefined && job.state === "POSTED" && (
            <span>{job.application_count} {job.application_count === 1 ? "applicant" : "applicants"}</span>
          )}
          {job.worker_name && <span>· {job.worker_name}</span>}
        </div>
      </div>
    </Link>
  );
}

function MyApplications({ apps }: { apps: AppLite[] }) {
  const [tab, setTab] = useState<WorkerTab>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return apps;
    if (tab === "pending") return apps.filter((a) => a.status === "pending");
    if (tab === "accepted") return apps.filter((a) => a.status === "accepted");
    if (tab === "rejected") return apps.filter((a) => a.status === "rejected" || a.status === "withdrawn");
    if (tab === "active") return apps.filter((a) => a.status === "accepted" && a.job_state !== "SETTLED" && a.job_state !== "CANCELLED");
    return apps;
  }, [apps, tab]);

  return (
    <>
      <div className="flex items-center gap-1.5 overflow-x-auto -mx-5 px-5 pb-2 mb-3">
        <FilterChip active={tab === "all"} onClick={() => setTab("all")}>All</FilterChip>
        <FilterChip active={tab === "pending"} onClick={() => setTab("pending")}>Pending</FilterChip>
        <FilterChip active={tab === "accepted"} onClick={() => setTab("accepted")}>Accepted</FilterChip>
        <FilterChip active={tab === "rejected"} onClick={() => setTab("rejected")}>Not selected</FilterChip>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📥"
          title={tab === "all" ? "You haven't applied to any jobs yet." : "Nothing matches this filter."}
          cta={tab === "all" ? { href: "/app/feed", label: "Browse open jobs" } : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((a) => <AppRow key={a.id} app={a} />)}
        </div>
      )}
    </>
  );
}

function AppRow({ app }: { app: AppLite }) {
  const tone =
    app.status === "accepted" ? "bg-forest-500 text-cream-50 ring-forest-600" :
    app.status === "rejected" || app.status === "withdrawn" ? "bg-ink/8 text-ink/55 ring-ink/10" :
    "bg-gold-400 text-ink ring-gold-500";

  return (
    <Link href={`/app/jobs/${app.job_id}`} className="block rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-4 hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-semibold tracking-tight leading-tight truncate">{app.job_title}</div>
          <div className="text-[12px] text-ink/55 mt-1">
            {categoryLabel[app.job_category] || app.job_category} · {app.job_area} · {timeAgo(app.created_at)}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase font-semibold text-ink/55 tracking-wider">Your offer</div>
          <div className="text-[14px] font-bold tracking-tight">{naira(app.offer_amount)}</div>
        </div>
      </div>
      {app.message && (
        <p className="mt-2 text-[12.5px] text-ink/70 line-clamp-2">"{app.message}"</p>
      )}
      <div className="mt-2.5 flex items-center justify-between text-[11px]">
        <span className={"rounded-full ring-1 px-2 py-0.5 font-semibold uppercase tracking-wider " + tone}>
          {app.status === "rejected" ? "Not selected" : app.status}
        </span>
        <span className="text-ink/55 uppercase tracking-wider font-semibold">
          Job: {stateLabel(app.job_state)}
        </span>
      </div>
    </Link>
  );
}

function AssignedJobs({ jobs }: { jobs: JobLite[] }) {
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");

  const filtered = useMemo(() => {
    if (tab === "all") return jobs;
    if (tab === "active") return jobs.filter((j) => j.state === "ASSIGNED" || j.state === "IN_PROGRESS" || j.state === "WORKER_COMPLETED");
    return jobs.filter((j) => j.state === "SETTLED");
  }, [jobs, tab]);

  return (
    <>
      <div className="flex items-center gap-1.5 overflow-x-auto -mx-5 px-5 pb-2 mb-3">
        <FilterChip active={tab === "all"} onClick={() => setTab("all")}>All</FilterChip>
        <FilterChip active={tab === "active"} onClick={() => setTab("active")}>Active</FilterChip>
        <FilterChip active={tab === "completed"} onClick={() => setTab("completed")}>Completed</FilterChip>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🛠"
          title={tab === "all" ? "No assigned jobs yet." : "Nothing matches this filter."}
          cta={tab === "all" ? { href: "/app/feed", label: "Browse open jobs" } : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((j) => <PostedJobRow key={j.id} job={j} />)}
        </div>
      )}
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1 transition " +
        (active ? "bg-coral-500 text-cream-50 ring-coral-500" : "bg-cream-50 text-ink/65 ring-ink/10 hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function EmptyState({ icon, title, cta }: { icon: string; title: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-2xl bg-cream-50 ring-1 ring-ink/10 p-8 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-[13.5px] text-ink/65">{title}</p>
      {cta && (
        <Link href={cta.href} className="inline-block mt-3 rounded-full bg-ink text-cream-50 px-4 py-2 text-[12.5px] font-semibold">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
