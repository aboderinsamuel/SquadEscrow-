import { redirect } from "next/navigation";
import { AuthForm } from "./AuthForm";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function AuthPage({ searchParams }: { searchParams: { role?: string } }) {
  // If the visitor is already authenticated, do not show the sign-in form —
  // send them to wherever they belong in the flow. Otherwise users who get
  // bounced back to /auth (e.g. a transient cookie miss during cold-start
  // navigation) see a phone form that looks like a restart of the whole flow.
  const me = await getSessionUser();
  if (me) {
    if ((me.kyc_tier ?? 0) > 0) redirect("/app/feed");
    redirect("/onboard");
  }
  const role = (searchParams.role === "worker" || searchParams.role === "customer") ? searchParams.role : undefined;
  return (
    <main className="relative min-h-[100dvh] flex flex-col page-bg">
      <header className="px-5 pt-6 flex items-center justify-between relative z-10">
        <Link href="/"><Logo size={28} /></Link>
        <Link href="/" className="text-sm text-ink/60 hover:text-ink">Back home</Link>
      </header>

      <div className="flex-1 grid place-items-center px-5 relative z-10">
        <div className="w-full max-w-[420px] py-10">
          <div className="mb-8 animate-rise">
            <div className="text-coral-500 text-[11px] font-semibold uppercase tracking-[0.18em]">Sign in</div>
            <h1 className="font-display text-[40px] font-bold mt-2 tracking-tightest leading-[0.95]">
              {role === "worker" ? "Get hired today." : role === "customer" ? "Hire a verified Nigerian." : "Welcome to jara."}
            </h1>
            <p className="text-ink/60 mt-3 text-[15px]">Phone number only. No password. OTP in seconds.</p>
          </div>
          <AuthForm initialRole={role} />
          <p className="mt-6 text-[12px] text-ink/45 leading-relaxed">
            By continuing you agree to Squadco Escrow's terms and acknowledge our NDPA-compliant data handling. We never share your NIN or BVN.
          </p>
        </div>
      </div>
    </main>
  );
}
