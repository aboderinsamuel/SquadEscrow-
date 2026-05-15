import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
<<<<<<< HEAD
import { readDB } from "@/lib/db";
=======
import { listBusinessUsers } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
import { seedIfEmpty } from "@/lib/seed";
import { AppHeader } from "@/components/AppHeader";
import { DiscoverGrid } from "./DiscoverGrid";
import { DiscoverReels } from "./DiscoverReels";

export default async function DiscoverPage({ searchParams }: { searchParams: { q?: string; cat?: string } }) {
<<<<<<< HEAD
  seedIfEmpty();
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  const db = readDB();

  const artisans = db.users
    .filter((u) => u.business_name)
=======
  await seedIfEmpty();
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  // Source: Supabase + cache merge. Ensures a freshly-onboarded artisan from
  // a different lambda still shows up — without this, the writing lambda's
  // cache had the user but the lambda serving Discover did not.
  const businessUsers = await listBusinessUsers();

  const artisans = businessUsers
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
    .map((u) => ({
      id: u.id,
      name: u.business_name || u.name,
      area: u.area || "Lagos",
      category: u.skills?.[0] || "other",
      avg_rating: u.avg_rating,
      jobs_completed: u.jobs_completed,
      credibility: u.credibility || 0,
      source: (u.source || "discovered") as "registered" | "discovered" | "claimed",
      claimed: !!u.claimed,
      followers: u.followers || 0,
      hourly_rate: u.hourly_rate || null,
      photos: u.business_photos || [],
      bio: u.bio || "",
      socials: (u.social_handles || []).slice(0, 3).map((h) => ({ platform: h.platform, handle: h.handle, verified: h.verified })),
    }));

  const reelsArtisans = artisans.map((a) => ({
    id: a.id,
    business_name: a.name,
    category: a.category,
    area: a.area,
    avg_rating: a.avg_rating,
    jobs_completed: a.jobs_completed,
    credibility: a.credibility,
    followers: a.followers,
    hourly_rate: a.hourly_rate,
    photos: a.photos,
    bio: a.bio,
    source: a.source,
    claimed: a.claimed,
  }));

  return (
    <>
      <AppHeader title="Discover" />
      <DiscoverReels artisans={reelsArtisans} />
      <div className="-mt-1 mb-4 text-[13px] text-ink/65">
        <b className="text-ink">{artisans.length}</b> artisans across Lagos · Scraped from Instagram, Jiji, WhatsApp Business + verified Squadco registrations
      </div>
      <DiscoverGrid all={artisans} />
    </>
  );
}
