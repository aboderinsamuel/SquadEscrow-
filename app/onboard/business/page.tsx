import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { bankList } from "@/lib/squad";
import { BusinessOnboard } from "./BusinessOnboard";

export default async function BusinessOnboardPage() {
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  return (
    <main className="relative min-h-[100dvh] page-bg">
      <header className="px-5 pt-6 relative z-10"><Logo size={26} /></header>
      <div className="relative z-10 px-5 py-6 max-w-[520px] mx-auto">
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-coral-500 font-semibold">Business setup · ~3 minutes</div>
          <h1 className="font-display text-[32px] font-bold tracking-tightest leading-[1.05] mt-1">Let's get you<br/>on the map.</h1>
        </div>
        <BusinessOnboard banks={bankList()} />
      </div>
    </main>
  );
}
