import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
<<<<<<< HEAD
import { readDB } from "@/lib/db";
=======
import { listBusinessUsers } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
import { seedIfEmpty } from "@/lib/seed";
import { MapView } from "./MapView";

export default async function MapPage() {
<<<<<<< HEAD
  seedIfEmpty();
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  const db = readDB();
  const artisans = db.users
    .filter((u) => u.geo && u.business_name)
=======
  await seedIfEmpty();
  const me = await getSessionUser();
  if (!me) redirect("/auth");
  const businessUsers = await listBusinessUsers();
  const artisans = businessUsers
    .filter((u) => u.geo)
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
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
