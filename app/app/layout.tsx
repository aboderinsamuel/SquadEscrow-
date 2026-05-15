import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
<<<<<<< HEAD
=======
import { SideNav } from "@/components/SideNav";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  return (
<<<<<<< HEAD
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-cream-200 text-ink">
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pb-32 pt-2">
        {children}
      </div>
=======
    <main className="relative min-h-[100dvh] bg-cream-200 text-ink">
      {/* Desktop side nav — hidden on mobile/tablet */}
      <SideNav userName={me.name || me.phone} />

      {/* Content — mobile: clamped to 440px + bottom nav; desktop: shifts right of sidebar */}
      <div className="relative z-10 lg:pl-[260px]">
        <div className="mx-auto w-full max-w-[440px] lg:max-w-[1100px] px-5 lg:px-10 pb-32 lg:pb-12 pt-2 lg:pt-8">
          {children}
        </div>
      </div>

>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
      <BottomNav />
    </main>
  );
}
