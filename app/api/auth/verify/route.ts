import { NextRequest, NextResponse } from "next/server";
import { mutateAndPersist, ensureHydrated, id } from "@/lib/db";
import { loginUser } from "@/lib/auth";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import type { User } from "@/lib/types";

function normalizePhone(p: string) {
  const digits = (p || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("234")) return "+" + digits;
  if (digits.startsWith("0")) return "+234" + digits.slice(1);
  if (digits.startsWith("8") || digits.startsWith("7") || digits.startsWith("9")) return "+234" + digits;
  return "+" + digits;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch {}
    const phone = body?.phone;
    const code = body?.code;
    if (!phone || !code) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });

    const norm = normalizePhone(phone);
    const db = await ensureHydrated();
    const otp = db.otps[norm];
    if (!otp || otp.expires_at < Date.now()) return NextResponse.json({ ok: false, error: "otp_expired" }, { status: 400 });
    if (otp.code !== code) return NextResponse.json({ ok: false, error: "bad_code" }, { status: 400 });

    let user = db.users.find((u) => u.phone === norm);

    // The in-memory cache is hydrated from a single `.select()` which Supabase
    // caps at 1000 rows. With the discovery seed in play, the users table
    // grows past 1000 quickly — meaning a perfectly valid existing user can be
    // missing from this lambda's cache. If we trust the cache, we'd create a
    // duplicate user with the same phone, which then trips the UNIQUE(phone)
    // constraint at flush time, which then takes the session row down with it
    // via the FK on sessions.user_id — and the user ends up bounced to /auth.
    //
    // Fall back to a direct Supabase lookup by phone before deciding it's a
    // new signup.
    if (!user && supabaseEnabled) {
      try {
        const sb = supabase();
        const r = await sb.from("users").select("*").eq("phone", norm).maybeSingle();
        if (r.data) {
          user = r.data as User;
          if (!db.users.find((u) => u.id === user!.id)) db.users.push(user);
        }
      } catch (e) {
        console.error("[/api/auth/verify] phone lookup fallback failed:", e);
      }
    }

    let new_user = false;
    if (!user) {
      new_user = true;
      user = {
        id: id("u"),
        phone: norm,
        name: "",
        role: "worker",
        kyc_tier: 0,
        jara_score: 0,
        jobs_completed: 0,
        avg_rating: 0,
        on_time_rate: 0,
        disputes: 0,
        created_at: Date.now(),
      };
      // Persist user + drop OTP synchronously so the session that follows
      // can reference a user that's already in Supabase.
      await mutateAndPersist((db) => {
        db.users.push(user!);
        delete db.otps[norm];
      });
    } else {
      await mutateAndPersist((db) => { delete db.otps[norm]; });
    }

    // Persist session synchronously — see loginUser() for why this matters.
    await loginUser(user.id);
    return NextResponse.json({ ok: true, new_user });
  } catch (e: any) {
    console.error("[/api/auth/verify] uncaught:", e);
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message || String(e) },
      { status: 500 },
    );
  }
}
