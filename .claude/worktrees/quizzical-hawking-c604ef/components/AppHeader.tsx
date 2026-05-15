"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";

export function AppHeader({ title, back, right }: { title?: string; back?: boolean; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 -mx-5 px-5 pt-[max(env(safe-area-inset-top),12px)] pb-3 bg-cream-200/90 backdrop-blur-md border-b border-ink/8">
      <div className="flex items-center justify-between gap-3 h-10">
        <div className="flex items-center gap-2.5">
          {back ? (
            <button onClick={() => router.back()} className="-ml-1 grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 text-ink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          ) : (
            <Link href="/app/feed"><Logo size={26} /></Link>
          )}
          {title && <h1 className="text-base font-bold tracking-tight text-ink">{title}</h1>}
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
