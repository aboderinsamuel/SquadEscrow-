import { cookies } from "next/headers";
import crypto from "node:crypto";
import { mutate, ensureHydrated } from "./db";
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
// Without this, the first request after a deploy reads an empty cache,
// finds no session, redirects to /auth, and the user gets stuck in a loop.
export async function getSessionUser(): Promise<User | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const db = await ensureHydrated();
  const s = db.sessions[token];
  if (!s) return null;
  return db.users.find((u) => u.id === s.user_id) || null;
}

export function loginUser(userId: string) {
  const token = newToken();
  mutate((db) => {
    db.sessions[token] = { user_id: userId, created_at: Date.now() };
  });
  setSessionCookie(token);
  return token;
}

export function logout() {
  const token = cookies().get(COOKIE)?.value;
  if (token) mutate((db) => { delete db.sessions[token]; });
  clearSessionCookie();
}
