import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

// Lightweight public-ish discovery feed. Used by the map page and any external integration.
export async function GET(req: NextRequest) {
  seedIfEmpty();
  const url = new URL(req.url);
  const cat = url.searchParams.get("cat");
  const area = url.searchParams.get("area");
  const minCred = parseInt(url.searchParams.get("min_credibility") || "0", 10);
  const db = readDB();
  const list = db.users
    .filter((u) => u.business_name)
    .filter((u) => !cat || u.skills?.[0] === cat)
    .filter((u) => !area || (u.area || "").toLowerCase().includes(area.toLowerCase()))
    .filter((u) => (u.credibility || 0) >= minCred)
    .map((u) => ({
      id: u.id,
      business_name: u.business_name,
      area: u.area,
      category: u.skills?.[0],
      avg_rating: u.avg_rating,
      jobs_completed: u.jobs_completed,
      credibility: u.credibility,
      source: u.source,
      followers: u.followers,
      geo: u.geo,
      socials: u.social_handles?.map((h) => ({ platform: h.platform, handle: h.handle, verified: h.verified })) || [],
    }))
    .sort((a, b) => (b.credibility || 0) - (a.credibility || 0));
  return NextResponse.json({ ok: true, count: list.length, items: list });
}
