/**
 * Hybrid persistence: in-memory DB (fast reads) backed by Supabase (durability)
 * with a JSON-file fallback for local dev without keys.
 *
 * - readDB() stays SYNC — same shape and behaviour as the previous JSON-only
 *   implementation, so every existing API route works unchanged.
 * - On server cold-start, hydration kicks off in the background. First request
 *   after start may briefly serve the JSON fallback (~200ms race), then all
 *   subsequent reads come from the in-memory cache.
 * - Every writeDB() flushes to BOTH the JSON file (sync, instant) AND Supabase
 *   (async, debounced). Supabase is the source of truth across restarts.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { DB } from "./types";
import { supabase, supabaseEnabled } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Vercel / AWS Lambda mount the deploy at /var/task with a read-only filesystem.
// Any fs.mkdirSync / fs.writeFileSync there throws EROFS and crashes the route.
// On those hosts we run pure in-memory + Supabase only. Local dev still uses
// the JSON file so restarts persist demo data.
const READONLY_FS =
  !!process.env.VERCEL ||
  !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.SQUADCO_READONLY_FS === "1";

function emptyDB(): DB {
  return {
    users: [],
    jobs: [],
    applications: [],
    transactions: [],
    webhooks: [],
    reviews: [],
    comments: [],
    likes: [],
    sessions: {},
    otps: {},
  };
}

// Stash state on globalThis so it survives Next.js dev-mode module reloads.
// In dev, HMR can re-instantiate this module on file changes — without this,
// every reload would wipe in-flight sessions and OTPs.
type DBGlobals = {
  __squadco_cache: DB | null;
  __squadco_hydration: Promise<DB> | null;
};
const g = globalThis as unknown as DBGlobals;
if (g.__squadco_cache === undefined) g.__squadco_cache = null;
if (g.__squadco_hydration === undefined) g.__squadco_hydration = null;

function getCache(): DB | null { return g.__squadco_cache; }
function setCache(v: DB | null) { g.__squadco_cache = v; }
function getHydrationPromise() { return g.__squadco_hydration; }
function setHydrationPromise(p: Promise<DB> | null) { g.__squadco_hydration = p; }

// ── JSON fallback (used when Supabase is off OR before hydration) ──────
function ensureDir() {
  if (READONLY_FS) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // EROFS / EACCES on host we didn't auto-detect. Swallow — caller falls
    // back to in-memory only.
  }
}
function readFromJSON(): DB {
  if (READONLY_FS) return emptyDB(); // no fs on Vercel/Lambda
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const empty = emptyDB();
    try { fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2)); } catch {}
    return empty;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
    return { ...emptyDB(), ...parsed };
  } catch {
    return emptyDB();
  }
}

// ── Supabase hydration ──────────────────────────────────────────────────
async function hydrateFromSupabase(): Promise<DB> {
  const sb = supabase();
  const results = await Promise.all([
    sb.from("users").select(),
    sb.from("jobs").select(),
    sb.from("applications").select(),
    sb.from("transactions").select(),
    sb.from("webhook_events").select(),
    sb.from("reviews").select(),
    sb.from("comments").select(),
    sb.from("likes").select(),
    sb.from("sessions").select(),
    sb.from("otps").select(),
  ]);

  // Detect missing-schema errors and bail out clearly instead of silently empty
  for (const r of results) {
    if (r.error && (r.error.code === "PGRST205" || r.error.message?.includes("schema cache") || r.error.code === "42P01")) {
      throw new Error("SCHEMA_NOT_FOUND: Supabase tables don't exist yet. Paste supabase/schema.sql into the Supabase SQL editor and re-run.");
    }
    if (r.error) {
      throw new Error(`Supabase select failed: ${r.error.message}`);
    }
  }

  const [u, j, a, t, w, r, c, l, s, o] = results;

  const sessions: DB["sessions"] = {};
  for (const row of (s.data || []) as any[]) sessions[row.token] = { user_id: row.user_id, created_at: Number(row.created_at) };
  const otps: DB["otps"] = {};
  for (const row of (o.data || []) as any[]) otps[row.phone] = { code: row.code, expires_at: Number(row.expires_at) };

  return {
    users: (u.data || []) as any,
    jobs: (j.data || []) as any,
    applications: (a.data || []) as any,
    transactions: (t.data || []) as any,
    webhooks: (w.data || []) as any,
    reviews: (r.data || []) as any,
    comments: (c.data || []) as any,
    likes: (l.data || []) as any,
    sessions,
    otps,
  };
}

// Kick off hydration as soon as this module loads (server-side).
// Important: hydration MUST NOT clobber the in-memory cache if something
// already populated it during the race. Otherwise live sessions are wiped.
if (supabaseEnabled && !getHydrationPromise()) {
  const p = hydrateFromSupabase()
    .then((db) => {
      if (!getCache()) {
        setCache(db);
        const counts = [`users=${db.users.length}`, `jobs=${db.jobs.length}`, `comments=${db.comments.length}`, `txns=${db.transactions.length}`].join(" ");
        console.log("[db] hydrated from Supabase:", counts);
      } else {
        console.log("[db] Supabase hydration completed but cache already populated — keeping in-memory state");
      }
      return getCache()!;
    })
    .catch((e) => {
      if (!getCache()) {
        console.error("[db] Supabase hydration failed — falling back to JSON:", e.message);
        setCache(readFromJSON());
      } else {
        console.warn("[db] Supabase hydration failed but cache already populated — keeping in-memory state:", e.message);
      }
      return getCache()!;
    });
  setHydrationPromise(p);
}

// Public sync read — used by every API route unchanged.
export function readDB(): DB {
  const c = getCache();
  if (c) return c;
  if (supabaseEnabled && getHydrationPromise()) {
    // Hydration in flight; serve JSON snapshot for this single request.
    console.warn("[db] readDB before Supabase hydration completed — using JSON fallback");
  }
  const fresh = readFromJSON();
  setCache(fresh);
  return fresh;
}

// Async variant — preferred where caller can await.
export async function ensureHydrated(): Promise<DB> {
  const p = getHydrationPromise();
  if (p) await p.catch(() => {});
  return readDB();
}

// ── Supabase flush ──────────────────────────────────────────────────────
function clean<T extends Record<string, any>>(row: T): T {
  // Replace undefined with null and trim phantom keys Supabase may not have columns for.
  const out: Record<string, any> = {};
  for (const k in row) out[k] = row[k] === undefined ? null : row[k];
  return out as T;
}

// Coerce values to match Postgres column types (rounding decimals where the
// schema declares INT, dropping fields that aren't columns, etc.).
function sanitizeUser(u: any) {
  return clean({
    ...u,
    jara_score: Math.round(u.jara_score || 0),
    jobs_completed: Math.round(u.jobs_completed || 0),
    disputes: Math.round(u.disputes || 0),
    likes: Math.round(u.likes || 0),
    followers: Math.round(u.followers || 0),
    credibility: Math.round(u.credibility || 0),
    hourly_rate: u.hourly_rate != null ? Math.round(u.hourly_rate) : null,
    response_time_min: u.response_time_min != null ? Math.round(u.response_time_min) : null,
    service_radius_km: u.service_radius_km != null ? Math.round(u.service_radius_km) : null,
  });
}

async function flushToSupabase(db: DB) {
  const sb = supabase();

  // Order matters because of foreign keys.
  // 1. Parents (users) must exist before children that reference them.
  const wave1: PromiseLike<any>[] = [];
  if (db.users.length) wave1.push(sb.from("users").upsert(db.users.map(sanitizeUser)));
  await Promise.all(wave1);

  // 2. Direct children of users.
  const wave2: PromiseLike<any>[] = [];
  if (db.jobs.length)       wave2.push(sb.from("jobs").upsert(db.jobs.map(clean)));
  if (db.comments.length)   wave2.push(sb.from("comments").upsert(db.comments.map(clean)));
  if (db.likes.length)      wave2.push(sb.from("likes").upsert(db.likes.map(clean), { onConflict: "user_id,target_id" }));
  if (db.webhooks.length)   wave2.push(sb.from("webhook_events").upsert(db.webhooks.map(clean)));
  const sessionRows = Object.entries(db.sessions).map(([token, s]) => clean({ token, ...s }));
  if (sessionRows.length)   wave2.push(sb.from("sessions").upsert(sessionRows));
  const otpRows = Object.entries(db.otps).map(([phone, o]) => clean({ phone, ...o }));
  if (otpRows.length)       wave2.push(sb.from("otps").upsert(otpRows));
  await Promise.all(wave2);

  // 3. Children of jobs (and grandchildren of users).
  const wave3: PromiseLike<any>[] = [];
  if (db.applications.length) wave3.push(sb.from("applications").upsert(db.applications.map(clean)));
  if (db.transactions.length) wave3.push(sb.from("transactions").upsert(db.transactions.map(clean)));
  if (db.reviews.length)      wave3.push(sb.from("reviews").upsert(db.reviews.map(clean)));
  const results = await Promise.all(wave3);

  // Surface persistent errors only (suppress duplicates and noise)
  const seen = new Set<string>();
  for (const r of [...wave1, ...wave2, ...wave3] as any[]) {
    const e = (await r)?.error;
    if (e?.message && !seen.has(e.message)) {
      console.error("[db] Supabase upsert:", e.message);
      seen.add(e.message);
    }
  }
}

// ── Write path ──────────────────────────────────────────────────────────
type WriteGlobals = { __squadco_writeQueued?: boolean };
const wg = globalThis as unknown as WriteGlobals;

export function writeDB() {
  const c = getCache();
  if (!c) return;
  if (wg.__squadco_writeQueued) return;
  wg.__squadco_writeQueued = true;
  process.nextTick(async () => {
    const cur = getCache();
    if (cur) {
      // Snapshot to JSON file when the filesystem is writable. On Vercel/Lambda
      // this is a no-op — Supabase is the source of truth.
      if (!READONLY_FS) {
        try {
          ensureDir();
          fs.writeFileSync(DB_FILE, JSON.stringify(cur, null, 2));
        } catch (e) {
          console.error("[db] JSON flush failed:", e);
        }
      }
      // Best-effort flush to Supabase
      if (supabaseEnabled) {
        try { await flushToSupabase(cur); }
        catch (e: any) { console.error("[db] Supabase flush failed:", e?.message); }
      }
    }
    wg.__squadco_writeQueued = false;
  });
}

export function mutate<T>(fn: (db: DB) => T): T {
  const db = readDB();
  const result = fn(db);
  writeDB();
  return result;
}

export function id(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export function hashPII(v: string) {
  return crypto.createHash("sha256").update(v).digest("hex").slice(0, 32);
}
