import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-cream-200 text-ink">
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pb-32 pt-2">
        {children}
      </div>
      <BottomNav />
    </main>
  );
}
