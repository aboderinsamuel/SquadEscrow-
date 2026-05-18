"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app/feed", label: "Jobs feed", icon: "feed" },
  { href: "/app/map", label: "Map", icon: "map" },
  { href: "/app/discover", label: "Discover", icon: "grid" },
  { href: "/app/post", label: "Post a job", icon: "plus", primary: true },
  { href: "/app/wallet", label: "Wallet", icon: "wallet" },
  { href: "/app/profile", label: "Profile", icon: "user" },
] as const;

function Icon({ name, dark }: { name: string; dark: boolean }) {
  const c = dark ? "#FFFFFF" : "#0A0A0A";
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "feed")  return <svg {...common}><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>;
  if (name === "map")   return <svg {...common}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v16M15 6v16"/></svg>;
  if (name === "grid")  return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
  if (name === "plus")  return <svg {...common} strokeWidth={2.4}><path d="M12 5v14M5 12h14"/></svg>;
  if (name === "wallet") return <svg {...common}><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v3"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M16 14h6"/><circle cx="18" cy="14" r="1.5"/></svg>;
  if (name === "user")  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>;
  return null;
}

export function SideNav({ userName }: { userName: string }) {
  const pathname = usePathname() || "";
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-[260px] flex-col bg-cream-50 ring-1 ring-ink/5 border-r border-ink/8">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <Link href="/app/feed"><Logo size={28} /></Link>
      </div>

      {/* Nav items */}
      <nav className="px-3 flex-1 space-y-1">
        {ITEMS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          if ((t as any).primary) {
            return (
              <Link key={t.href} href={t.href} className="flex items-center gap-3 mx-2 mt-3 mb-1 px-4 py-3 rounded-full bg-coral-500 text-cream-50 font-semibold shadow-pop hover:bg-coral-400 transition-colors">
                <Icon name={t.icon} dark />
                <span>{t.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-colors text-[14px] font-medium",
                active ? "bg-ink text-cream-50" : "text-ink/70 hover:text-ink hover:bg-ink/5",
              )}
            >
              <Icon name={t.icon} dark={active} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer card */}
      <div className="p-4">
        <div className="rounded-2xl bg-ink text-cream-50 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-cream-50/55 font-semibold">Signed in</div>
          <div className="mt-1 font-semibold truncate">{userName || "Anonymous"}</div>
          <Link href="/operator" className="mt-3 inline-block text-[11px] text-cream-50/70 hover:text-cream-50 underline underline-offset-2">Operator console →</Link>
        </div>
      </div>
    </aside>
  );
}
