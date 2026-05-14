import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated, mutateAndPersist, id } from "@/lib/db";
import { loginUser } from "@/lib/auth";
import { seedIfEmpty } from "@/lib/seed";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import type { User } from "@/lib/types";

// One-tap demo sign-in used on the auth page so hackathon judges can step
// through "hire" and "apply" flows without waiting on OTP delivery.
//
// Only the phones in DEMO_ACCOUNTS are accepted. Anything else is rejected.
// In production with real customers this route can be disabled via env.
const DEMO_ACCOUNTS: Record<string, {
  name: string;
  role: "worker" | "customer";
  kyc_tier: 0 | 1 | 2 | 3;
  area: string;
  bio?: string;
  skills?: string[];
  bank_code?: string;
  account_number?: string;
  account_name?: string;
  business_name?: string;
}> = {
  "+2348011234567": {
    name: "Tunde A. Adeleke",
    role: "worker",
    kyc_tier: 3,
    area: "Mushin",
    bio: "I sabi gen, AC, fridge. 5+ years for repair.",
    skills: ["generator", "electrical"],
    bank_code: "058",
    account_number: "0123456789",
    account_name: "TUNDE A. ADELEKE",
  },
  "+2348022345678": {
    name: "Aisha M. Ibrahim",
    role: "worker",
    kyc_tier: 3,
    area: "Yaba",
    bio: "Remote data labelling and VA work. UNIBEN final year.",
    skills: ["data_entry", "transcription", "social_media"],
    bank_code: "058",
    account_number: "0234567890",
    account_name: "AISHA M. IBRAHIM",
  },
  "+2348077890123": {
    name: "Mrs. Okonkwo",
    role: "customer",
    kyc_tier: 2,
    area: "Ikoyi",
  },
};

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch {}
    const phone = body?.phone;
    if (!phone || !DEMO_ACCOUNTS[phone]) {
      return NextResponse.json({ ok: false, error: "not_a_demo_account" }, { status: 400 });
    }

    // Make sure the seed has run on this lambda so the demo account exists.
    await seedIfEmpty();

    const db = await ensureHydrated();
    let user = db.users.find((u) => u.phone === phone);

    // If cache doesn't have them, hit Supabase directly (deploys grow past
    // the 1000-row default page size and the cache can be partial).
    if (!user && supabaseEnabled) {
      try {
        const sb = supabase();
        const r = await sb.from("users").select("*").eq("phone", phone).maybeSingle();
        if (r.data) {
          user = r.data as User;
          if (!db.users.find((u) => u.id === user!.id)) db.users.push(user);
        }
      } catch (e) {
        console.error("[/api/auth/demo] phone lookup failed:", e);
      }
    }

    // Final fallback: provision the demo account on the fly so the demo
    // works even on a fresh deploy where the seed hasn't landed yet.
    if (!user) {
      const spec = DEMO_ACCOUNTS[phone];
      const newUser: User = {
        id: id("u"),
        phone,
        name: spec.name,
        role: spec.role,
        kyc_tier: spec.kyc_tier,
        liveness_passed: spec.kyc_tier >= 2,
        bank_code: spec.bank_code,
        account_number: spec.account_number,
        account_name: spec.account_name,
        area: spec.area,
        bio: spec.bio,
        skills: spec.skills,
        business_name: spec.business_name,
        jara_score: spec.role === "customer" ? 720 : 700,
        jobs_completed: 0,
        avg_rating: 4.8,
        on_time_rate: 0.95,
        disputes: 0,
        created_at: Date.now(),
      };
      await mutateAndPersist((db) => { db.users.push(newUser); });
      user = newUser;
    }

    await loginUser(user.id);
    return NextResponse.json({ ok: true, role: user.role, name: user.name });
  } catch (e: any) {
    console.error("[/api/auth/demo] uncaught:", e);
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message || String(e) },
      { status: 500 },
    );
  }
}
