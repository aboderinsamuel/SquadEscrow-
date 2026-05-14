-- ────────────────────────────────────────────────────────────────────────────
-- Squadco Escrow · Supabase schema
-- ────────────────────────────────────────────────────────────────────────────
-- Paste this entire file into your Supabase project's SQL Editor and run.
-- It is idempotent — safe to run multiple times.
--
-- After running, verify in Table Editor that 10 tables exist under `public`.
-- ────────────────────────────────────────────────────────────────────────────

-- 1. USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                  TEXT PRIMARY KEY,
  phone               TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL DEFAULT '',
  role                TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('worker', 'customer', 'both')),
  nin_hash            TEXT,
  bvn_hash            TEXT,
  kyc_tier            SMALLINT NOT NULL DEFAULT 0 CHECK (kyc_tier BETWEEN 0 AND 3),
  selfie_url          TEXT,
  liveness_passed     BOOLEAN DEFAULT FALSE,
  bank_code           TEXT,
  account_number      TEXT,
  account_name        TEXT,
  area                TEXT,
  bio                 TEXT,
  skills              JSONB DEFAULT '[]'::jsonb,
  jara_score          INT NOT NULL DEFAULT 0,
  jobs_completed      INT NOT NULL DEFAULT 0,
  avg_rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  on_time_rate        NUMERIC(4,3) NOT NULL DEFAULT 0,
  disputes            INT NOT NULL DEFAULT 0,
  created_at          BIGINT NOT NULL,
  -- Discovery / business profile
  business_name       TEXT,
  source              TEXT CHECK (source IN ('registered', 'discovered', 'claimed')),
  discovered_at       BIGINT,
  claimed             BOOLEAN DEFAULT FALSE,
  geo                 JSONB,
  social_handles      JSONB DEFAULT '[]'::jsonb,
  business_photos     JSONB DEFAULT '[]'::jsonb,
  service_radius_km   INT,
  fraud_signals       JSONB,
  likes               INT NOT NULL DEFAULT 0,
  followers           INT NOT NULL DEFAULT 0,
  credibility         INT NOT NULL DEFAULT 0,
  hourly_rate         INT,
  response_time_min   INT
);

CREATE INDEX IF NOT EXISTS users_phone_idx ON public.users(phone);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS users_business_name_idx ON public.users(business_name);
CREATE INDEX IF NOT EXISTS users_source_idx ON public.users(source);


-- 2. JOBS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jobs (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  worker_id       TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,
  amount          BIGINT NOT NULL,
  offer_amount    BIGINT,
  area            TEXT NOT NULL,
  urgency         TEXT NOT NULL CHECK (urgency IN ('today', 'this_week', 'flexible')),
  state           TEXT NOT NULL CHECK (state IN ('POSTED','FUNDED','ASSIGNED','IN_PROGRESS','WORKER_COMPLETED','SETTLED','DISPUTED','CANCELLED')),
  escrow_va       TEXT,
  escrow_ref      TEXT,
  funded_at       BIGINT,
  assigned_at     BIGINT,
  completed_at    BIGINT,
  settled_at      BIGINT,
  payout_ref      TEXT,
  created_at      BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS jobs_customer_idx ON public.jobs(customer_id);
CREATE INDEX IF NOT EXISTS jobs_worker_idx ON public.jobs(worker_id);
CREATE INDEX IF NOT EXISTS jobs_state_idx ON public.jobs(state);
CREATE INDEX IF NOT EXISTS jobs_escrow_ref_idx ON public.jobs(escrow_ref);


-- 3. APPLICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id              TEXT PRIMARY KEY,
  job_id          TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id       TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  offer_amount    BIGINT NOT NULL,
  message         TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  created_at      BIGINT NOT NULL,
  UNIQUE (job_id, worker_id)
);


-- 4. TRANSACTIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id              TEXT PRIMARY KEY,
  job_id          TEXT REFERENCES public.jobs(id) ON DELETE SET NULL,
  user_id         TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('escrow_in','payout_out','refund','fee')),
  channel         TEXT NOT NULL CHECK (channel IN ('card','bank','ussd','transfer','va')),
  squad_ref       TEXT NOT NULL,
  amount          BIGINT NOT NULL,
  fee             BIGINT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL CHECK (status IN ('pending','success','failed','reversed')),
  payload         JSONB,
  created_at      BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS tx_user_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS tx_job_idx ON public.transactions(job_id);
CREATE INDEX IF NOT EXISTS tx_ref_idx ON public.transactions(squad_ref);


-- 5. WEBHOOK EVENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id              TEXT PRIMARY KEY,
  event_type      TEXT NOT NULL,
  signature       TEXT NOT NULL DEFAULT '',
  raw_body        TEXT NOT NULL DEFAULT '',
  payload         JSONB,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at    BIGINT NOT NULL
);


-- 6. REVIEWS (the job-rating one) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id              TEXT PRIMARY KEY,
  job_id          TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id     TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewed_id     TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stars           SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      BIGINT NOT NULL
);


-- 7. COMMENTS (multi-source reviews) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id              TEXT PRIMARY KEY,
  target_id       TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  author_id       TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  author_name     TEXT NOT NULL,
  author_handle   TEXT,
  text            TEXT NOT NULL,
  stars           SMALLINT CHECK (stars IS NULL OR stars BETWEEN 1 AND 5),
  likes           INT NOT NULL DEFAULT 0,
  source          TEXT NOT NULL DEFAULT 'in_app' CHECK (source IN ('in_app','instagram','jiji','whatsapp','google')),
  created_at      BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS comments_target_idx ON public.comments(target_id);


-- 8. LIKES (user ↔ artisan) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_id       TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at      BIGINT NOT NULL,
  PRIMARY KEY (user_id, target_id)
);


-- 9. SESSIONS (server-side session store) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  token           TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at      BIGINT NOT NULL
);


-- 10. OTPS (short-lived OTP codes) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.otps (
  phone           TEXT PRIMARY KEY,
  code            TEXT NOT NULL,
  expires_at      BIGINT NOT NULL
);


-- ────────────────────────────────────────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- ────────────────────────────────────────────────────────────────────────────
-- service_role bypasses everything (server-side code uses this key).
-- anon can read public catalogues (artisan discovery + comments).
-- authenticated can read/write their own data via standard policies.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps           ENABLE ROW LEVEL SECURITY;

-- ── Public read on artisan directory ──────────────────────────────────────
DROP POLICY IF EXISTS users_public_read ON public.users;
CREATE POLICY users_public_read ON public.users FOR SELECT
  TO anon, authenticated
  USING (business_name IS NOT NULL);

-- ── Public read on comments + likes (credibility data) ────────────────────
DROP POLICY IF EXISTS comments_public_read ON public.comments;
CREATE POLICY comments_public_read ON public.comments FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS likes_public_read ON public.likes;
CREATE POLICY likes_public_read ON public.likes FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- ── Sensitive tables: no anon/authenticated access; service_role bypasses ─
-- (Leaving these tables RLS-enabled with no policies = locked from anon/auth.)
-- otps, sessions, transactions, webhook_events, applications, jobs, reviews
-- are touched only by server-side code using the service_role key.


-- ────────────────────────────────────────────────────────────────────────────
-- Done. Verify by running:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- You should see 10 tables.
-- ────────────────────────────────────────────────────────────────────────────
