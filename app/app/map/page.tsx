import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listBusinessUsers } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { MapView } from "./MapView";

export default async function MapPage() {
  await seedIfEmpty();
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  const businessUsers = await listBusinessUsers();
  const artisans = businessUsers
    .filter((u) => u.geo)
    .map((u) => ({
      id: u.id,
      name: u.business_name || u.name,
      area: u.area || "Lagos",
      category: u.skills?.[0] || "other",
      avg_rating: u.avg_rating,
      jobs_completed: u.jobs_completed,
      credibility: u.credibility || 0,
      source: u.source || "discovered",
      claimed: !!u.claimed,
      followers: u.followers || 0,
      response_time_min: u.response_time_min || null,
      hourly_rate: u.hourly_rate || null,
      photos: u.business_photos || [],
      socials: (u.social_handles || []).map((h) => ({ platform: h.platform, handle: h.handle, verified: h.verified, followers: h.followers })),
      geo: u.geo!,
    }));

  return <MapView artisans={artisans} />;
}
