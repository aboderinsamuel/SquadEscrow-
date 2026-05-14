import Link from "next/link";
import { categoryLabel, naira, timeAgo, stateLabel } from "@/lib/utils";
import type { Job } from "@/lib/types";

// Each job card picks a tone based on category/state to create the colorful
// rhythm from the mockup feed. Coral for urgent, forest for remote/white-collar,
// ink for default, cream for older/everyday.

type Tone = "cream" | "ink" | "coral" | "forest" | "gold";

function pickTone(job: Job): Tone {
  if (job.urgency === "today") return "coral";
  if (job.category === "data_entry" || job.category === "graphic_design" || job.category === "social_media" || job.category === "transcription" || job.category === "tutoring") return "forest";
  if (job.category === "generator" || job.category === "ac_hvac" || job.category === "electrical") return "ink";
  if (job.category === "errand" || job.category === "delivery") return "cream";
  return "cream";
}

const toneSurface: Record<Tone, string> = {
  cream: "bg-cream-50 ring-1 ring-ink/12 text-ink",
  ink: "bg-ink-900 text-cream-50",
  coral: "bg-coral-500 text-cream-50",
  forest: "bg-forest-900 text-cream-50",
  gold: "bg-gold-400 text-ink",
};

const pricePill: Record<Tone, string> = {
  cream: "bg-ink text-cream-50",
  ink: "bg-cream-50 text-ink",
  coral: "bg-gold-400 text-ink",
  forest: "bg-cream-100 text-ink",
  gold: "bg-ink text-cream-50",
};

const subColor: Record<Tone, string> = {
  cream: "text-ink/55",
  ink: "text-cream-50/65",
  coral: "text-cream-50/85",
  forest: "text-cream-50/65",
  gold: "text-ink/65",
};

const statusPill: Record<Tone, string> = {
  cream: "bg-ink/8 text-ink/55",
  ink: "bg-cream-50/10 text-cream-50/70",
  coral: "bg-cream-50/15 text-cream-50",
  forest: "bg-cream-50/10 text-cream-50/70",
  gold: "bg-ink/10 text-ink/65",
};

export function JobCard({ job, customerName }: { job: Job; customerName?: string }) {
  const tone = pickTone(job);
  return (
    <Link
      href={`/app/jobs/${job.id}`}
      className={"block rounded-2xl px-4 py-3.5 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 animate-rise " + toneSurface[tone]}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold tracking-tight leading-tight truncate">{job.title}</div>
          <div className={"mt-1 text-[12px] " + subColor[tone]}>
            <span>{job.area}</span>
            <span className="mx-1.5 opacity-50">·</span>
            <span>{categoryLabel[job.category]}</span>
            {job.urgency === "today" && <><span className="mx-1.5 opacity-50">·</span><span className="font-semibold uppercase tracking-wider">URGENT</span></>}
          </div>
        </div>
        <span className={"shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold tracking-tight " + pricePill[tone]}>
          {naira(job.amount)}
        </span>
      </div>
      <div className={"mt-2 flex items-center gap-2 text-[11px] " + subColor[tone]}>
        <span className="opacity-75">{timeAgo(job.created_at)}</span>
        {customerName && <span className="opacity-60 truncate max-w-[120px]">· {customerName}</span>}
        <span className={"ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " + statusPill[tone]}>
          {stateLabel(job.state)}
        </span>
      </div>
    </Link>
  );
}
