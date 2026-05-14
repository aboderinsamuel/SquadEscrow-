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
  const q = url.searchParams.get("q");
  
  let aiMatchedIds: string[] | null = null;
  if (q) {
    try {
      const aiUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
      const apiKey = process.env.AI_API_KEY || "your_secret_api_key_here";
      const aiRes = await fetch(`${aiUrl}/search`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({ query: q, limit: 20 }),
        // short timeout so it fails fast if python backend isn't running
        signal: AbortSignal.timeout(2000)
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiMatchedIds = aiData.results || [];
      }
    } catch (e) {
      console.warn("Python AI backend unreachable, falling back to local search.");
    }
  }

  const db = readDB();
  let list = db.users.filter((u) => u.business_name);
  
  if (aiMatchedIds !== null) {
    list = list.filter((u) => aiMatchedIds!.includes(u.id));
  } else if (q) {
    // Fallback basic text search
    const Q = q.toLowerCase();
    list = list.filter((u) => 
      u.business_name?.toLowerCase().includes(Q) || 
      u.bio?.toLowerCase().includes(Q) || 
      u.area?.toLowerCase().includes(Q)
    );
  }

  const results = list
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
    
  return NextResponse.json({ ok: true, count: results.length, items: results });
}
