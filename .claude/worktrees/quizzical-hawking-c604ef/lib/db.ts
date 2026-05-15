import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { DB } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

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

let cache: DB | null = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readDB(): DB {
  if (cache) return cache;
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    cache = emptyDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
    return cache;
  }
  const raw = fs.readFileSync(DB_FILE, "utf8");
  try {
    cache = JSON.parse(raw) as DB;
  } catch {
    cache = emptyDB();
  }
  // Merge in case schema added new top-level keys.
  cache = { ...emptyDB(), ...cache };
  return cache;
}

let writeQueued = false;
export function writeDB() {
  if (!cache) return;
  if (writeQueued) return;
  writeQueued = true;
  process.nextTick(() => {
    ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
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
