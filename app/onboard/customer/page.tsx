import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { bankList } from "@/lib/squad";
import { CustomerOnboard } from "./CustomerOnboard";

export default async function CustomerOnboardPage() {
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  return (
    <main className="relative min-h-[100dvh] page-bg">
      <header className="px-5 pt-6 relative z-10"><Logo size={26} /></header>
      <div className="relative z-10 px-5 py-6 max-w-[500px] mx-auto">
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-coral-500 font-semibold">Customer setup · 60 seconds</div>
          <h1 className="font-display text-[32px] font-bold tracking-tightest leading-[1.05] mt-1">Verify your NIN.<br/><span className="text-ink/55">That's it.</span></h1>
        </div>
        <CustomerOnboard banks={bankList()} />
      </div>
    </main>
  );
}
