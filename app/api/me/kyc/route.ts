import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutate } from "@/lib/db";
import { hashPII } from "@/lib/db";
import { nameMatchScore } from "@/lib/discovery";
import type { SocialHandle } from "@/lib/types";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const body = await req.json();
  const {
    nin, bvn, bank_code, account_number, account_name, liveness_passed,
    skills, area, bio, role,
    // Business-onboarding extras:
    business_name, social_handles, business_photos, geo, service_radius_km, hourly_rate, response_time_min,
  } = body;

  if (!nin || String(nin).length !== 11) return NextResponse.json({ ok: false, error: "nin_invalid" }, { status: 400 });

  // Customer path may skip bank — only validate when provided.
  const hasBank = !!(account_number || account_name);
  if (hasBank) {
    if (String(account_number || "").length !== 10 || !account_name) {
      return NextResponse.json({ ok: false, error: "account_invalid" }, { status: 400 });
    }
  }

  mutate((db) => {
    const u = db.users.find((x) => x.id === me.id);
    if (!u) return;
    u.nin_hash = hashPII(String(nin));
    if (bvn) u.bvn_hash = hashPII(String(bvn));
    u.liveness_passed = !!liveness_passed;
    if (hasBank) {
      u.bank_code = String(bank_code);
      u.account_number = String(account_number);
      u.account_name = String(account_name);
    }
    u.skills = Array.isArray(skills) ? skills.slice(0, 12) : (u.skills || []);
    u.area = String(area || u.area || "").slice(0, 80);
    u.bio = String(bio || u.bio || "").slice(0, 400);
    if (role === "worker" || role === "customer" || role === "both") u.role = role;
    u.kyc_tier = (bvn ? 3 : (liveness_passed ? 2 : 1)) as any;
    u.jara_score = Math.max(u.jara_score || 0, role === "customer" ? 720 : 580);
    if (business_name) {
      u.business_name = String(business_name).slice(0, 80);
      u.source = "registered";
      u.claimed = true;
    }
    if (Array.isArray(social_handles)) u.social_handles = (social_handles as SocialHandle[]).slice(0, 6);
    if (Array.isArray(business_photos)) u.business_photos = business_photos.slice(0, 6);
    if (geo && typeof geo.lat === "number" && typeof geo.lng === "number") u.geo = { lat: geo.lat, lng: geo.lng, precision: "exact" };
    if (typeof service_radius_km === "number") u.service_radius_km = service_radius_km;
    if (typeof hourly_rate === "number") u.hourly_rate = hourly_rate;
    if (typeof response_time_min === "number") u.response_time_min = response_time_min;

    // Compute fraud signals
    const nameMatch = (u.business_name && u.account_name) ? nameMatchScore(u.business_name, u.account_name) : (u.account_name ? 100 : 0);
    u.fraud_signals = {
      nin_matches_bvn: !!bvn,
      account_name_match_score: nameMatch,
      account_age_days: u.fraud_signals?.account_age_days || 0,
      social_age_days: u.fraud_signals?.social_age_days || 0,
      device_reuse_count: 0,
      geo_state_consistency: true,
      squad_tx_count: 0,
      last_check: Date.now(),
    };
  });

  return NextResponse.json({ ok: true });
}
