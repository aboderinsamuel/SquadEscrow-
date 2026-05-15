import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PostJobForm } from "./PostJobForm";

export default function PostPage() {
  const me = getSessionUser();
  if (!me) redirect("/auth");
  return (
    <>
      <AppHeader title="Post a job" />
      <div className="mt-5 mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-coral-500">New job</div>
        <h1 className="font-display text-[30px] font-bold tracking-tightest leading-[1.05] mt-1.5">Describe what<br/>you need.</h1>
        <p className="text-[14px] text-ink/65 mt-3">Funds go into a Squad Virtual Account — released only when you mark the job complete.</p>
      </div>
      <PostJobForm />
    </>
  );
}
