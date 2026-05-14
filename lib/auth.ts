import { cookies } from "next/headers";
import crypto from "node:crypto";
import { mutate, mutateAndPersist, ensureHydrated, flushNow, persistSession, deleteSession } from "./db";
import { supabase, supabaseEnabled } from "./supabase";
import type { User } from "./types";

const COOKIE = "jara_session";

export function newToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE);
}

// Async so it can wait for Supabase hydration on cold-start lambdas.
//
// Cache miss → direct Supabase lookup. This is the key fix for the
// "post-OTP loop" on Vercel: a freshly cold-started lambda's hydration
// completes BEFORE the user's session row gets written by a different
// lambda, so the cache is permanently stale on that instance. ensureHydrated
// just awaits the existing promise — it doesn't re-fetch. Falling back to
// Supabase directly here means we always see the truth.
export async function getSessionUser(): Promise<User | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;

  // Fast path: in-memory cache
  const db = await ensureHydrated();
  const cached = db.sessions[token];
  if (cached) {
    const cachedUser = db.users.find((u) => u.id === cached.user_id);
    if (cachedUser) return cachedUser;
  }

  // Slow path: direct Supabase lookup for sessions written by another lambda
  if (!supabaseEnabled) return null;
  try {
    const sb = supabase();
    const sessRes = await sb
      .from("sessions")
      .select("token, user_id, created_at")
      .eq("token", token)
      .maybeSingle();
    if (sessRes.error || !sessRes.data) return null;

    const userRes = await sb
      .from("users")
      .select("*")
      .eq("id", sessRes.data.user_id)
      .maybeSingle();
    if (userRes.error || !userRes.data) return null;

    // Backfill the cache so subsequent reads on this lambda are fast.
    db.sessions[token] = {
      user_id: sessRes.data.user_id,
      created_at: Number(sessRes.data.created_at),
    };
    if (!db.users.find((u) => u.id === userRes.data.id)) {
      db.users.push(userRes.data as User);
    }
    return userRes.data as User;
  } catch (e) {
    console.error("[auth] Supabase fallback lookup failed:", e);
    return null;
  }
}

// Awaits the Supabase write before returning the session token, so the
// session row is durable across lambda instances. Without this, the next
// request can hit a different lambda whose cache has no record of the
// session (because process.nextTick flushes are dropped on lambda freeze).
export async function loginUser(userId: string): Promise<string> {
  const token = newToken();
  // Targeted write — only the session row, not the entire DB. Without
  // this the auth flow re-upserts 1000+ users every login and hits
  // Vercel's 10s function timeout.
  await persistSession(token, userId);
  setSessionCookie(token);
  return token;
}

export async function logout() {
  const token = cookies().get(COOKIE)?.value;
  if (token) await deleteSession(token);
  clearSessionCookie();
}
