import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

export default async function OnboardChooser() {
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  return (
    <main className="relative min-h-[100dvh] page-bg">
      <header className="px-5 pt-6 relative z-10 flex items-center justify-between">
        <Logo size={26} />
        <span className="text-[11px] text-ink/45 uppercase tracking-[0.16em]">Setup</span>
      </header>

      <div className="relative z-10 px-5 py-8 max-w-[500px] mx-auto">
        <h1 className="font-display text-[34px] font-bold tracking-tightest leading-[1.05]">
          Welcome{me.name ? `, ${me.name.split(" ")[0]}` : ""}.<br/>
          <span className="text-ink/55">How will you use Squadco Escrow?</span>
        </h1>
        <p className="mt-3 text-ink/65 text-[14px] leading-relaxed">Two different setups. Pick whichever matches you — you can do both later.</p>

        <div className="mt-6 space-y-3">
          {/* Business / artisan card */}
          <Link href="/onboard/business" className="block rounded-3xl bg-coral-500 text-cream-50 p-5 shadow-pop hover:-translate-y-0.5 transition-transform">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] opacity-80">Business · artisan · freelancer</div>
                <h3 className="font-bold text-[22px] mt-1 tracking-tight">I want to find work.</h3>
                <p className="mt-2 text-[13px] text-cream-50/85 leading-relaxed max-w-[28ch]">Full business profile with social handles, work photos, service areas, and bank for payouts. Onboarding ~3 min.</p>
              </div>
              <div className="text-4xl shrink-0">🛠</div>
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap text-[11px] text-cream-50/85">
              <Pill>NIN + BVN + Liveness</Pill>
              <Pill>Link IG / Jiji / WhatsApp</Pill>
              <Pill>Pin on the map</Pill>
              <Pill>Squadco Score + loans</Pill>
            </div>
          </Link>

          {/* Customer card */}
          <Link href="/onboard/customer" className="block rounded-3xl bg-ink text-cream-50 p-5 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] opacity-65">Hiring someone</div>
                <h3 className="font-bold text-[22px] mt-1 tracking-tight">I want to hire.</h3>
                <p className="mt-2 text-[13px] text-cream-50/75 leading-relaxed max-w-[28ch]">Lean setup — just NIN and a bank account for refunds. Post a job and pay only when it's done. ~60 sec.</p>
              </div>
              <div className="text-4xl shrink-0">🤝</div>
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap text-[11px] text-cream-50/75">
              <Pill>NIN only</Pill>
              <Pill>Optional bank for refunds</Pill>
              <Pill>Browse + map + escrow</Pill>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-[11px] text-ink/45 text-center">You can switch or add the other role anytime from your profile.</p>
      </div>
    </main>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-cream-50/15 ring-1 ring-cream-50/15 px-2.5 py-1 font-medium">{children}</span>;
}
