export type Role = "worker" | "customer" | "both";
export type KycTier = 0 | 1 | 2 | 3;
export type ProfileSource = "registered" | "discovered" | "claimed";
export type SocialPlatform = "instagram" | "whatsapp" | "twitter" | "tiktok" | "facebook" | "jiji" | "google";

export interface GeoPoint { lat: number; lng: number; precision?: "exact" | "area" | "city" }

export interface SocialHandle {
  platform: SocialPlatform;
  handle: string;
  url?: string;
  verified: boolean;
  followers?: number;
  since?: string; // ISO month e.g. "2022-03"
}

export interface FraudSignals {
  nin_matches_bvn?: boolean;
  account_name_match_score?: number; // 0-100 fuzzy match: business name vs account name
  account_age_days?: number;
  social_age_days?: number;
  device_reuse_count?: number;
  geo_state_consistency?: boolean;
  squad_tx_count?: number;
  last_check?: number;
}

export type JobState =
  | "POSTED"
  | "FUNDED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WORKER_COMPLETED"
  | "SETTLED"
  | "DISPUTED"
  | "CANCELLED";

export type Category =
  | "generator"
  | "plumbing"
  | "electrical"
  | "ac_hvac"
  | "carpentry"
  | "painting"
  | "tiling"
  | "cleaning"
  | "errand"
  | "delivery"
  | "hairstyling"
  | "tailoring"
  | "photography"
  | "data_entry"
  | "graphic_design"
  | "social_media"
  | "transcription"
  | "tutoring"
  | "other";

export interface User {
  id: string;
  phone: string;
  name: string;
  role: Role;
  nin_hash?: string;
  bvn_hash?: string;
  kyc_tier: KycTier;
  selfie_url?: string;
  liveness_passed?: boolean;
  bank_code?: string;
  account_number?: string;
  account_name?: string;
  area?: string;
  bio?: string;
  skills?: string[];
  jara_score: number;
  jobs_completed: number;
  avg_rating: number;
  on_time_rate: number;
  disputes: number;
  created_at: number;
  // Discovery + business profile fields
  business_name?: string;
  source?: ProfileSource;
  discovered_at?: number;
  claimed?: boolean;
  geo?: GeoPoint;
  social_handles?: SocialHandle[];
  business_photos?: string[]; // emoji-coded gallery for demo, or URLs
  service_radius_km?: number;
  fraud_signals?: FraudSignals;
  likes?: number;
  followers?: number;
  credibility?: number; // 0-100 combined social proof score
  hourly_rate?: number;
  response_time_min?: number;
}

export interface Comment {
  id: string;
  target_id: string; // user being reviewed
  author_id?: string; // null for scraped
  author_name: string;
  author_handle?: string; // e.g. @instagram
  text: string;
  stars?: number;
  likes: number;
  source: "in_app" | "instagram" | "jiji" | "whatsapp" | "google";
  created_at: number;
}

export interface Like {
  user_id: string;
  target_id: string;
  created_at: number;
}

export interface Job {
  id: string;
  customer_id: string;
  worker_id?: string;
  title: string;
  description: string;
  category: Category;
  amount: number; // naira
  offer_amount?: number; // accepted offer if different from posted
  area: string;
  urgency: "today" | "this_week" | "flexible";
  state: JobState;
  escrow_va?: string;
  escrow_ref?: string;
  funded_at?: number;
  assigned_at?: number;
  completed_at?: number;
  settled_at?: number;
  payout_ref?: string;
  created_at: number;
}

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  offer_amount: number;
  message: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: number;
}

export interface Transaction {
  id: string;
  job_id?: string;
  user_id?: string;
  type: "escrow_in" | "payout_out" | "refund" | "fee";
  channel: "card" | "bank" | "ussd" | "transfer" | "va";
  squad_ref: string;
  amount: number;
  fee: number;
  status: "pending" | "success" | "failed" | "reversed";
  payload?: Record<string, unknown>;
  created_at: number;
}

export interface WebhookEvent {
  id: string;
  event_type: string;
  signature: string;
  raw_body: string;
  payload: Record<string, unknown>;
  verified: boolean;
  processed_at: number;
}

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewed_id: string;
  stars: number;
  comment?: string;
  created_at: number;
}

export interface Session {
  user_id: string;
  created_at: number;
}

export interface DB {
  users: User[];
  jobs: Job[];
  applications: Application[];
  transactions: Transaction[];
  webhooks: WebhookEvent[];
  reviews: Review[];
  comments: Comment[];
  likes: Like[];
  sessions: Record<string, Session>;
  otps: Record<string, { code: string; expires_at: number }>;
}
