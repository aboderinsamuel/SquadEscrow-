import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { readDB, findUserById } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, SectionTitle } from "@/components/Card";
import { SocialChip } from "@/components/SocialChip";
import { TrustPanel } from "@/components/TrustPanel";
import { Reviews } from "@/components/Reviews";
import { ClaimButton } from "./ClaimButton";
import { LikeButton } from "./LikeButton";
import { BitmojiAvatar } from "@/components/BitmojiAvatar";
import { categoryLabel, naira } from "@/lib/utils";

export default async function ArtisanProfile({ params }: { params: { id: string } }) {
  seedIfEmpty();
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  // Use the Supabase-fallback helper so we don't 404 when the artisan record
  // exists in Supabase but is missing from this lambda's partial cache.
  const a = await findUserById(params.id);
  if (!a || !a.business_name) notFound();
  const db = readDB();

  const comments = db.comments.filter((c) => c.target_id === a.id);
  const verified = a.source === "registered" || a.claimed;
  const photos = a.business_photos || [];
  const liked = !!db.likes.find((l) => l.user_id === me.id && l.target_id === a.id);

  return (
    <>
      <AppHeader back />

      {/* Header card — bold, Bitmoji avatar, business name */}
      <section className="-mt-1">
        <div className="rounded-3xl bg-ink text-cream-50 overflow-hidden">
          {/* Cover strip with Bitmoji as the centerpiece */}
          <div className="relative h-40 bg-gradient-to-br from-coral-500 via-gold-400 to-forest-500 overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
            <div className="absolute inset-0 grid place-items-center">
              <BitmojiAvatar seed={a.id} size={120} ring />
            </div>
            {/* Floating service emoji badges */}
            {photos.slice(0, 3).map((p, i) => (
              <div key={i} className={"absolute text-2xl " + ["top-3 right-4","bottom-3 left-4","top-3 left-4"][i]} style={{ animation: `bobbing ${3 + i * 0.5}s ease-in-out infinite` }}>
                <span className="inline-grid h-10 w-10 place-items-center rounded-2xl bg-cream-50 ring-1 ring-ink/15 shadow-card">{p}</span>
              </div>
            ))}
            <style>{`@keyframes bobbing{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h1 className="text-[26px] font-bold tracking-tightest leading-[1.05]">{a.business_name}</h1>
                <div className="text-[13px] text-cream-50/70 mt-1">{categoryLabel[a.skills?.[0] || "other"] || "Service"} · {a.area}</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {a.credibility && a.credibility >= 85 && <Badge tone="gold">★ Top {a.credibility}</Badge>}
                {verified ? <Badge tone="forest">Verified</Badge> : <Badge tone="gold">Scraped — unclaimed</Badge>}
              </div>
            </div>

            <p className="mt-3 text-[14px] text-cream-50/80 leading-relaxed">{a.bio}</p>

            {/* Stat row */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              <Stat label="Rating" v={`★ ${a.avg_rating.toFixed(1)}`} />
              <Stat label="Jobs" v={String(a.jobs_completed)} />
              <Stat label="Likes" v={String(a.likes || 0)} />
              <Stat label="Responds" v={a.response_time_min ? `${a.response_time_min}m` : "—"} />
            </div>

            <div className="mt-5 flex gap-2">
              <Link href={`/app/post?to=${a.id}`} className="flex-1"><Button block size="lg">Hire — Squad escrow</Button></Link>
              <LikeButton targetId={a.id} initialLiked={liked} initialCount={a.likes || 0} />
            </div>
          </div>
        </div>
      </section>

      {/* Socials */}
      {(a.social_handles && a.social_handles.length > 0) && (
        <section className="mt-6">
          <SectionTitle hint={`${a.social_handles.length} platforms`}>Social presence</SectionTitle>
          <div className="flex items-center gap-1.5 flex-wrap">
            {a.social_handles.map((h, i) => (
              <SocialChip key={i} platform={h.platform as any} handle={h.handle} verified={h.verified} followers={h.followers} />
            ))}
          </div>
          {a.source === "discovered" && !a.claimed && (
            <Card className="mt-3 bg-gold-200 ring-gold-400">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream-50 text-sm shrink-0">!</div>
                <div className="flex-1">
                  <div className="font-bold text-ink">This profile was scraped from public sources</div>
                  <p className="text-[12.5px] text-ink/65 mt-1">We aggregated public Instagram/Jiji/WhatsApp Business listings to bootstrap the directory. Owner: claim it to get NIN verification, escrow payouts, and the JARA Score.</p>
                  <ClaimButton targetId={a.id} className="mt-3" />
                </div>
              </div>
            </Card>
          )}
        </section>
      )}

      {/* Pricing */}
      {a.hourly_rate && (
        <section className="mt-6">
          <SectionTitle>Pricing</SectionTitle>
          <Card>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink/55">Typical rate</div>
                <div className="text-2xl font-bold tracking-tight text-ink mt-0.5">{naira(a.hourly_rate)} <span className="text-[13px] text-ink/55">/ hour</span></div>
              </div>
              <Badge tone="cream">Negotiable</Badge>
            </div>
            <div className="hairline my-3" />
            <div className="text-[12px] text-ink/65">Final price is set per job · funds locked in a Squad Virtual Account · released when both sides confirm.</div>
          </Card>
        </section>
      )}

      {/* Trust */}
      <section className="mt-6">
        <SectionTitle>Trust & verification</SectionTitle>
        <TrustPanel
          signals={a.fraud_signals || {}}
          accountName={a.account_name}
          businessName={a.business_name}
          ninPresent={!!a.nin_hash || a.kyc_tier >= 1}
          bvnPresent={!!a.bvn_hash || a.kyc_tier >= 3}
          livenessPassed={!!a.liveness_passed}
          source={(a.source || "discovered") as any}
        />
      </section>

      {/* Reviews */}
      <section className="mt-6">
        <SectionTitle hint={`${comments.length} reviews`}>Reviews</SectionTitle>
        <Reviews targetId={a.id} initialComments={comments} canPost={true} />
      </section>
    </>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-xl bg-cream-50/12 ring-1 ring-cream-50/15 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-cream-50/55">{label}</div>
      <div className="text-[14px] font-bold mt-0.5">{v}</div>
    </div>
  );
}
