import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureHydrated } from "@/lib/db";
import { supabase, supabaseEnabled } from "@/lib/supabase";

// Diagnostic endpoint for debugging the "unauth" / session-loop issue on Vercel.
// Hit it in the browser after you get bounced and it'll tell you exactly why.
// Returns:
//   - whether Supabase env vars are set
//   - whether the schema is reachable
//   - whether your cookie has a session token
//   - whether that token exists in the in-memory cache
//   - whether that token exists in Supabase directly (bypasses cache)
//   - whether the corresponding user exists in Supabase
//
// Safe to leave deployed — returns no secrets. Remove or gate it later.
export async function GET() {
  const out: any = {
    // Pinned build marker — must match the commit you expect to be live.
    // If this string changes in a later commit and Vercel still returns the
    // old one, the deploy is stale.
    build: "404-fix-and-auth-ux-v4",
    deploy: {
      vercelGitCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelRegion: process.env.VERCEL_REGION || null,
    },
    env: {
      supabaseEnabled,
      supabaseUrl: process.env.SUPABASE_URL ? "set" : "missing",
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing",
      squadSecret: process.env.SQUAD_SECRET_KEY ? "set" : "missing",
      smsSenderId: process.env.SQUAD_SMS_SENDER_ID || null,
      vercel: !!process.env.VERCEL,
    },
  };

  const cookieToken = cookies().get("jara_session")?.value || null;
  out.cookie = {
    present: !!cookieToken,
    tokenPrefix: cookieToken ? cookieToken.slice(0, 8) + "..." : null,
  };

  // Hydrate cache + report what's in it
  let cache: any = null;
  try {
    cache = await ensureHydrated();
    out.cache = {
      ok: true,
      users: cache.users.length,
      sessions: Object.keys(cache.sessions).length,
      otps: Object.keys(cache.otps).length,
      hasMySession: cookieToken ? !!cache.sessions[cookieToken] : false,
    };
  } catch (e: any) {
    out.cache = { ok: false, error: e?.message || String(e) };
  }

  // Direct Supabase probe — bypasses cache so we see ground truth
  if (supabaseEnabled) {
    try {
      const sb = supabase();
      const probe: any = {};

      // Can we even read the sessions table?
      const sessRes = await sb.from("sessions").select("token, user_id, created_at").limit(5);
      probe.sessionsTable = sessRes.error
        ? { error: sessRes.error.message, code: sessRes.error.code }
        : { ok: true, rows: sessRes.data?.length ?? 0 };

      // Is OUR session in Supabase?
      if (cookieToken) {
        const meSess = await sb.from("sessions").select("token, user_id, created_at").eq("token", cookieToken).maybeSingle();
        probe.mySession = meSess.error
          ? { error: meSess.error.message }
          : meSess.data
            ? { found: true, user_id: meSess.data.user_id }
            : { found: false };

        // If we found the session row, is the user row also in Supabase?
        if (meSess.data?.user_id) {
          const meUser = await sb.from("users").select("id, phone, name, role, kyc_tier").eq("id", meSess.data.user_id).maybeSingle();
          probe.myUser = meUser.error
            ? { error: meUser.error.message }
            : meUser.data
              ? { found: true, ...meUser.data }
              : { found: false };
        }
      }

      // Table row counts (helps catch schema-not-applied)
      const tables = ["users", "sessions", "otps", "jobs", "applications", "transactions"];
      probe.counts = {};
      for (const t of tables) {
        const r = await sb.from(t).select("*", { count: "exact", head: true });
        probe.counts[t] = r.error ? `err: ${r.error.message}` : r.count;
      }

      out.supabase = probe;
    } catch (e: any) {
      out.supabase = { error: e?.message || String(e) };
    }
  } else {
    out.supabase = { skipped: "supabaseEnabled is false — env vars missing" };
  }

  // Diagnose the most common cause
  let diagnosis = "unknown";
  if (!supabaseEnabled) {
    diagnosis = "Supabase env vars not set on this deploy. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel project settings and redeploy.";
  } else if (out.cache?.ok === false) {
    diagnosis = "Supabase hydration failed — likely SCHEMA_NOT_FOUND. Paste supabase/schema.sql into the Supabase SQL editor and re-run.";
  } else if (cookieToken && out.cache?.hasMySession === false && out.supabase?.mySession?.found === false) {
    diagnosis = "Your cookie has a session token, but neither the in-memory cache nor Supabase has a matching row. Sessions are being created in one lambda and lost before they're written to Supabase. The mutateAndPersist() fix should resolve this — confirm this deploy includes that commit.";
  } else if (cookieToken && out.cache?.hasMySession === false && out.supabase?.mySession?.found === true) {
    diagnosis = "Session is in Supabase but not in this lambda's cache yet. ensureHydrated() should have loaded it — check if this route is awaiting hydration properly.";
  } else if (!cookieToken) {
    diagnosis = "No session cookie present. Either you haven't logged in, or the cookie is being stripped (cross-domain, secure mismatch).";
  } else {
    diagnosis = "Looks healthy.";
  }
  out.diagnosis = diagnosis;

  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
