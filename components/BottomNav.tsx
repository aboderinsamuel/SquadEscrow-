"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app/map", label: "Map", icon: "map" },
  { href: "/app/discover", label: "Discover", icon: "grid" },
  { href: "/app/post", label: "Post", icon: "plus", primary: true },
  { href: "/app/feed", label: "Jobs", icon: "feed" },
  { href: "/app/profile", label: "Me", icon: "user" },
] as const;

function Icon({ name, dark }: { name: string; dark: boolean }) {
  const c = dark ? "#FDF8EF" : "#0A0A0A";
  if (name === "feed") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>
  );
  if (name === "plus") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
  );
  if (name === "map") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v16M15 6v16"/></svg>
  );
  if (name === "grid") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  );
  if (name === "user") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
  );
  return null;
}

export function BottomNav() {
  const pathname = usePathname() || "";
  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 pointer-events-none">
      <div className="mx-auto max-w-[480px] px-4 pointer-events-auto">
        <div className="rounded-full bg-cream-50 ring-1 ring-ink/10 shadow-card px-1.5 py-1.5 flex items-center gap-1">
          {TABS.map((t) => {
            const active = pathname.startsWith(t.href);
            if ('primary' in t && t.primary) {
              return (
                <Link key={t.href} href={t.href} className={cn("relative grid place-items-center rounded-full h-12 w-12 mx-1 transition", "bg-coral-500 text-cream-50 shadow-pop hover:bg-coral-400")}>
                  <Icon name={t.icon} dark />
                </Link>
              );
            }
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center gap-0.5 rounded-full py-2 transition-colors",
                  active ? "bg-ink text-cream-50" : "text-ink/60 hover:text-ink",
                )}
              >
                <Icon name={t.icon} dark={active} />
                <span className={cn("text-[10px] font-semibold tracking-wide", active ? "text-cream-50" : "")}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
