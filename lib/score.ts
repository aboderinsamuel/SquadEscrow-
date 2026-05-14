import type { User } from "./types";

export interface ScoreBreakdown {
  score: number; // 300-850
  completion: number;
  onTime: number;
  rating: number;
  earnings: number;
  disputes: number;
  kyc: number;
  tenure: number;
  bandLabel: string;
  bandColor: string;
  loanCeiling: number;
  loanApr: number; // %/mo
}

export function jaraScore(u: Partial<User>): ScoreBreakdown {
  const completedJobs = u.jobs_completed ?? 0;
  const onTime = u.on_time_rate ?? 0;
  const rating = u.avg_rating ?? 0;
  const disputes = u.disputes ?? 0;
  const kycTier = u.kyc_tier ?? 0;
  const tenureDays = u.created_at ? Math.floor((Date.now() - u.created_at) / 86_400_000) : 0;

  // 12-ingredient model from the deck (slide 19), using dynamic credibility if available
  let s = 300;
  if (u.credibility !== undefined) {
    // scale credibility (0-100) to score (300-850)
    s = 300 + (u.credibility / 100) * 550;
  } else {
    s += Math.min(120, completedJobs * 4); // completion (max 120)
    s += Math.min(100, onTime * 100); // on-time delivery (max 100)
    s += Math.min(120, rating * 24); // avg rating (max 120 @ 5.0)
    s += Math.min(80, completedJobs * 1.5); // earnings velocity proxy
    s -= Math.min(120, disputes * 30); // dispute penalty
    s += kycTier * 20; // KYC strength
    s += Math.min(40, tenureDays * 0.2); // tenure
  }
  s = Math.max(300, Math.min(850, Math.round(s)));

  let bandLabel = "Building";
  let bandColor = "from-jade-700 to-jade-900";
  let loanCeiling = 0;
  let loanApr = 0;

  if (s >= 750) { bandLabel = "Trusted+"; bandColor = "from-jade-400 to-jade-700"; loanCeiling = 500_000; loanApr = 2.5; }
  else if (s >= 700) { bandLabel = "Trusted"; bandColor = "from-jade-500 to-jade-800"; loanCeiling = 100_000; loanApr = 3.0; }
  else if (s >= 650) { bandLabel = "Solid"; bandColor = "from-jade-600 to-jade-900"; loanCeiling = 25_000; loanApr = 4.0; }
  else if (s >= 580) { bandLabel = "Starter"; bandColor = "from-amber500 to-rose500"; loanCeiling = 5_000; loanApr = 6.0; }

  return { score: s, completion: completedJobs, onTime, rating, earnings: 0, disputes, kyc: kycTier, tenure: tenureDays, bandLabel, bandColor, loanCeiling, loanApr };
}
