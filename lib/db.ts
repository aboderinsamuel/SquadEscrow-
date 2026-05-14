import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { DB } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Vercel / AWS Lambda mount the deploy at /var/task with a read-only
// filesystem. Any fs.mkdirSync / fs.writeFileSync against the deploy dir
// throws EROFS and crashes the route (which then returns an HTML 500 that
// the client can't parse as JSON). On those hosts we keep the in-memory
// cache only — fine for the demo since the seed re-runs on every cold
// start. For real persistence, swap this module for a Postgres/Supabase
// client per the README roadmap.
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

// Stash the cache on globalThis so it survives Next.js module reloads.
type DBGlobals = { __squadco_cache: DB | null };
const g = globalThis as unknown as DBGlobals;
if (g.__squadco_cache === undefined) g.__squadco_cache = null;

function ensureDir() {
  if (READONLY_FS) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // EROFS / EACCES on a host we didn't auto-detect — swallow so callers
    // fall back to in-memory.
  }
}

export function readDB(): DB {
  if (g.__squadco_cache) return g.__squadco_cache;

  if (READONLY_FS) {
    // No fs available — start from an empty DB. seedIfEmpty() will populate it.
    g.__squadco_cache = emptyDB();
    return g.__squadco_cache;
  }

  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    g.__squadco_cache = emptyDB();
    try { fs.writeFileSync(DB_FILE, JSON.stringify(g.__squadco_cache, null, 2)); } catch {}
    return g.__squadco_cache;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as DB;
    g.__squadco_cache = { ...emptyDB(), ...parsed };
  } catch {
    g.__squadco_cache = emptyDB();
  }
  return g.__squadco_cache;
}

let writeQueued = false;
export function writeDB() {
  if (!g.__squadco_cache) return;
  if (READONLY_FS) return; // no-op on Vercel/Lambda
  if (writeQueued) return;
  writeQueued = true;
  process.nextTick(() => {
    try {
      ensureDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(g.__squadco_cache, null, 2));
    } catch (e) {
      console.error("[db] JSON flush failed:", e);
    }
    writeQueued = false;
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
