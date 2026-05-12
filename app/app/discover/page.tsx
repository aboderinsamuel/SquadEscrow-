import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { AppHeader } from "@/components/AppHeader";
import { DiscoverGrid } from "./DiscoverGrid";

export default function DiscoverPage({ searchParams }: { searchParams: { q?: string; cat?: string } }) {
  seedIfEmpty();
  const me = getSessionUser();
  if (!me) redirect("/auth");
  const db = readDB();

  const artisans = db.users
    .filter((u) => u.business_name)
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

  return (
    <>
      <AppHeader title="Discover" />
      <div className="-mt-1 mb-4 text-[13px] text-ink/65">
        <b className="text-ink">{artisans.length}</b> artisans across Lagos · Scraped from Instagram, Jiji, WhatsApp Business + verified Squadco registrations
      </div>
      <DiscoverGrid all={artisans} />
    </>
  );
}
