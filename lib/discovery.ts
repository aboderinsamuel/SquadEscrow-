import { mutateAndPersist, readDB, ensureHydrated, id, hashPII } from "./db";
import type { User, SocialHandle, Comment } from "./types";

// Fuzzy name-match score — simulates Squad account_name vs business_name check.
// Returns 0–100. Same impl can be used at runtime by the trust panel.
export function nameMatchScore(a: string, b: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/).filter(Boolean);
  const A = new Set(norm(a));
  const B = new Set(norm(b));
  if (!A.size || !B.size) return 0;
  let hits = 0;
  for (const t of A) if (B.has(t)) hits++;
  return Math.round((hits / Math.max(A.size, B.size)) * 100);
}

// Lagos coordinate map for seeded discovery — real neighbourhoods.
const LAGOS_AREAS: Record<string, [number, number]> = {
  Lekki: [6.4474, 3.4724],
  Ikoyi: [6.4500, 3.4406],
  "Victoria Island": [6.4281, 3.4218],
  Yaba: [6.5158, 3.3686],
  Surulere: [6.4969, 3.3553],
  Ikeja: [6.6018, 3.3515],
  "Computer Village": [6.6018, 3.3445],
  Ojuelegba: [6.5180, 3.3500],
  Mushin: [6.5320, 3.3500],
  Festac: [6.4683, 3.2826],
  Ajah: [6.4674, 3.5856],
  Gbagada: [6.5566, 3.3886],
  Magodo: [6.6118, 3.3899],
  Maryland: [6.5707, 3.3691],
  Apapa: [6.4499, 3.3596],
  Ibeju: [6.4690, 3.6850],
  Oshodi: [6.5500, 3.3434],
  Iyana: [6.5260, 3.3270],
};

// Slight jitter so pins don't perfectly overlap.
function jitter(coord: number, amt = 0.008) {
  return coord + (Math.random() - 0.5) * amt * 2;
}

export interface DiscoverySeed {
  business_name: string;
  category: string;
  area: keyof typeof LAGOS_AREAS;
  social: SocialHandle[];
  bio: string;
  photos: string[];
  credibility: number; // 60-98
  followers: number;
  jobs_completed: number;
  avg_rating: number; // 3.5-5.0
  hourly_rate?: number;
  response_time_min?: number;
  source: "discovered" | "registered" | "claimed";
  bank_code?: string;
  account_name?: string;
}

const SEED: DiscoverySeed[] = [
  {
    business_name: "Gen Genius Lagos",
    category: "generator",
    area: "Lekki",
    social: [
      { platform: "instagram", handle: "@gengeniuslagos", url: "https://instagram.com/gengeniuslagos", verified: true, followers: 4280, since: "2021-03" },
      { platform: "whatsapp", handle: "+234 803 555 7712", verified: true },
      { platform: "jiji", handle: "jiji.ng/gengenius", verified: true },
    ],
    bio: "Generator sales, service & emergency repair. Tiger, Sumec, Honda. Same-day callout, ₦5k diagnostic. Lekki & VI.",
    photos: ["⚡", "🔧", "🛠"],
    credibility: 92, followers: 4280, jobs_completed: 132, avg_rating: 4.8,
    hourly_rate: 8000, response_time_min: 22,
    source: "discovered",
    bank_code: "058", account_name: "ADELEKE TUNDE A",
  },
  {
    business_name: "AC Queen Naija",
    category: "ac_hvac",
    area: "Ikoyi",
    social: [
      { platform: "instagram", handle: "@acqueennaija", verified: true, followers: 8910, since: "2020-07" },
      { platform: "tiktok", handle: "@acqueennaija", verified: false, followers: 12_400 },
      { platform: "whatsapp", handle: "+234 814 222 6660", verified: true },
    ],
    bio: "AC installation, deep-clean & gas refill. Split, central, ceiling. Lagos Island. ⚡ same-day for emergencies.",
    photos: ["❄️", "🧰", "🪛"],
    credibility: 95, followers: 8910, jobs_completed: 187, avg_rating: 4.9,
    hourly_rate: 12000, response_time_min: 15,
    source: "discovered",
  },
  {
    business_name: "Tunde Plumbing & POP",
    category: "plumbing",
    area: "Surulere",
    social: [
      { platform: "instagram", handle: "@tundeplumberlagos", verified: false, followers: 1240, since: "2023-01" },
      { platform: "whatsapp", handle: "+234 816 003 9921", verified: true },
    ],
    bio: "Pipes, toilet repair, kitchen sinks, POP ceiling work. Surulere, Yaba, Ojuelegba. Tools-on-site.",
    photos: ["🔧", "🚿"],
    credibility: 78, followers: 1240, jobs_completed: 56, avg_rating: 4.5,
    hourly_rate: 4500, response_time_min: 35,
    source: "discovered",
  },
  {
    business_name: "Aisha Data Labs",
    category: "data_entry",
    area: "Yaba",
    social: [
      { platform: "twitter", handle: "@aisha_datalabs", verified: true, followers: 3300, since: "2022-11" },
      { platform: "instagram", handle: "@aisha.datalabs", verified: false, followers: 980 },
    ],
    bio: "Remote data entry, spreadsheet cleanup, SKU catalogue. UNIBEN graduate. Per-row pricing or hourly. Naira payouts.",
    photos: ["⌨️", "📊"],
    credibility: 84, followers: 4280, jobs_completed: 42, avg_rating: 4.9,
    hourly_rate: 2500, response_time_min: 60,
    source: "registered",
  },
  {
    business_name: "Master Emeka Carpentry",
    category: "carpentry",
    area: "Mushin",
    social: [
      { platform: "facebook", handle: "Master Emeka Carpentry", verified: false, followers: 612, since: "2019-04" },
      { platform: "whatsapp", handle: "+234 803 777 0011", verified: true },
    ],
    bio: "Custom wardrobes, bookshelves, doors. 12 years experience. Workshop in Mushin. Delivery + assembly included.",
    photos: ["🪚", "🪑", "🚪"],
    credibility: 86, followers: 612, jobs_completed: 98, avg_rating: 4.7,
    hourly_rate: 6000, response_time_min: 90,
    source: "discovered",
  },
  {
    business_name: "Folake Beauty Hub",
    category: "hairstyling",
    area: "Lekki",
    social: [
      { platform: "instagram", handle: "@folakebeautyhub", verified: true, followers: 22_100, since: "2019-08" },
      { platform: "tiktok", handle: "@folake.hub", verified: true, followers: 41_300 },
      { platform: "whatsapp", handle: "+234 805 411 8800", verified: true },
    ],
    bio: "Home hairstyling: braids, weaves, wigs, retouch. Lekki, VI, Ikoyi. Bridal packages available.",
    photos: ["💇", "💅", "👰"],
    credibility: 96, followers: 63_400, jobs_completed: 214, avg_rating: 4.8,
    hourly_rate: 10000, response_time_min: 12,
    source: "discovered",
  },
  {
    business_name: "Pixel by Bola",
    category: "graphic_design",
    area: "Ikeja",
    social: [
      { platform: "instagram", handle: "@pixelbybola", verified: false, followers: 5230, since: "2021-11" },
      { platform: "twitter", handle: "@pixelbybola", verified: false, followers: 880 },
    ],
    bio: "Brand identity, IG content, logo packs. Quick turnaround. References on portfolio.bybola.co.",
    photos: ["🎨", "🖌️"],
    credibility: 81, followers: 6110, jobs_completed: 71, avg_rating: 4.6,
    hourly_rate: 8500, response_time_min: 45,
    source: "discovered",
  },
  {
    business_name: "Light Up Lagos Electrics",
    category: "electrical",
    area: "Ikeja",
    social: [
      { platform: "whatsapp", handle: "+234 811 999 4400", verified: true },
      { platform: "google", handle: "Light Up Lagos · 4.6★ (38)", verified: true, followers: 0 },
      { platform: "jiji", handle: "jiji.ng/lightuplagos", verified: true },
    ],
    bio: "House wiring, inverter installation, solar consults. Certified by NABCB. Lagos mainland coverage.",
    photos: ["💡", "🔌", "☀️"],
    credibility: 89, followers: 0, jobs_completed: 144, avg_rating: 4.7,
    hourly_rate: 9000, response_time_min: 25,
    source: "discovered",
  },
  {
    business_name: "Chioma Cleans",
    category: "cleaning",
    area: "Surulere",
    social: [
      { platform: "instagram", handle: "@chioma.cleans", verified: false, followers: 1800, since: "2023-05" },
      { platform: "whatsapp", handle: "+234 902 111 0099", verified: true },
    ],
    bio: "Deep cleaning, post-construction, AirBnB turnaround. Eco products. Lagos-wide.",
    photos: ["🧹", "🪣"],
    credibility: 74, followers: 1800, jobs_completed: 64, avg_rating: 4.6,
    hourly_rate: 4000, response_time_min: 40,
    source: "registered",
  },
  {
    business_name: "Musa Solar & Inverter",
    category: "electrical",
    area: "Magodo",
    social: [
      { platform: "instagram", handle: "@musa_solar_ng", verified: true, followers: 12_600, since: "2020-02" },
      { platform: "facebook", handle: "Musa Solar Nigeria", verified: false, followers: 2200 },
      { platform: "whatsapp", handle: "+234 816 555 1122", verified: true },
    ],
    bio: "Solar systems 1kVA to 20kVA. Free survey. Financing via partner. 2-year warranty.",
    photos: ["☀️", "🔋", "⚡"],
    credibility: 94, followers: 14_800, jobs_completed: 167, avg_rating: 4.8,
    hourly_rate: 15000, response_time_min: 30,
    source: "discovered",
  },
  {
    business_name: "Quick Errand Lagos",
    category: "errand",
    area: "Ojuelegba",
    social: [
      { platform: "whatsapp", handle: "+234 906 388 0011", verified: true },
      { platform: "instagram", handle: "@quick.errand.lag", verified: false, followers: 720 },
    ],
    bio: "Same-day pickups across Lagos. Market runs, document drops, hospital errands. Bike + tricycle fleet.",
    photos: ["🛵", "📦"],
    credibility: 71, followers: 720, jobs_completed: 89, avg_rating: 4.4,
    hourly_rate: 2500, response_time_min: 18,
    source: "discovered",
  },
  {
    business_name: "Bayo Paints Pro",
    category: "painting",
    area: "Gbagada",
    social: [
      { platform: "instagram", handle: "@bayopaintspro", verified: false, followers: 3100, since: "2022-06" },
      { platform: "tiktok", handle: "@bayopaints", verified: false, followers: 4400 },
      { platform: "jiji", handle: "jiji.ng/bayopaints", verified: true },
    ],
    bio: "Interior & exterior painting. Texture, screed, faux finishes. Lagos mainland. Quote in 24h.",
    photos: ["🎨", "🖌️"],
    credibility: 82, followers: 7500, jobs_completed: 73, avg_rating: 4.6,
    hourly_rate: 6500, response_time_min: 50,
    source: "discovered",
  },
  {
    business_name: "Sade Tailoring",
    category: "tailoring",
    area: "Yaba",
    social: [
      { platform: "instagram", handle: "@sade.tailor", verified: true, followers: 9400, since: "2021-09" },
      { platform: "whatsapp", handle: "+234 812 666 7700", verified: true },
    ],
    bio: "Native, casual, bridal. Lagos pickup + delivery. RushPay turnaround in 48h.",
    photos: ["🪡", "👗"],
    credibility: 90, followers: 9400, jobs_completed: 156, avg_rating: 4.9,
    hourly_rate: 5500, response_time_min: 25,
    source: "discovered",
  },
  {
    business_name: "Captured by Tobi",
    category: "photography",
    area: "Victoria Island",
    social: [
      { platform: "instagram", handle: "@capturedbytobi", verified: true, followers: 31_200, since: "2019-12" },
      { platform: "twitter", handle: "@tobicaptures", verified: false, followers: 4400 },
    ],
    bio: "Weddings, portraits, brand shoots. Studio in VI. Drone + full team available.",
    photos: ["📸", "🎬"],
    credibility: 93, followers: 35_600, jobs_completed: 128, avg_rating: 4.9,
    hourly_rate: 25000, response_time_min: 60,
    source: "discovered",
  },
  {
    business_name: "Tile Masters Naija",
    category: "tiling",
    area: "Ajah",
    social: [
      { platform: "instagram", handle: "@tilemastersng", verified: false, followers: 2400, since: "2022-03" },
      { platform: "whatsapp", handle: "+234 803 818 4422", verified: true },
    ],
    bio: "Ceramic, porcelain, marble. Bathrooms, kitchens, full-floor. Per-sqm pricing. 5-year workmanship warranty.",
    photos: ["🟫", "🛠"],
    credibility: 79, followers: 2400, jobs_completed: 48, avg_rating: 4.6,
    hourly_rate: 5000, response_time_min: 90,
    source: "discovered",
  },
  {
    business_name: "Naomi Social Studio",
    category: "social_media",
    area: "Maryland",
    social: [
      { platform: "instagram", handle: "@naomisocial", verified: true, followers: 18_700, since: "2021-04" },
      { platform: "twitter", handle: "@naomisocial", verified: false, followers: 3300 },
      { platform: "tiktok", handle: "@naomisocialstudio", verified: false, followers: 6600 },
    ],
    bio: "IG + TikTok management for SMEs. Content calendars, captions, monthly reports. Remote-only.",
    photos: ["📱", "📊"],
    credibility: 88, followers: 28_600, jobs_completed: 84, avg_rating: 4.7,
    hourly_rate: 7500, response_time_min: 120,
    source: "registered",
  },
  {
    business_name: "Funmi Transcribes",
    category: "transcription",
    area: "Gbagada",
    social: [
      { platform: "twitter", handle: "@funmitypes", verified: false, followers: 880, since: "2023-08" },
    ],
    bio: "Audio-to-text, podcast transcripts, meeting notes. English + pidgin. ₦80 per minute. 24h turnaround.",
    photos: ["🎧", "⌨️"],
    credibility: 72, followers: 880, jobs_completed: 31, avg_rating: 4.7,
    hourly_rate: 2000, response_time_min: 90,
    source: "registered",
  },
  {
    business_name: "Bolu Bakes & Delivery",
    category: "delivery",
    area: "Festac",
    social: [
      { platform: "instagram", handle: "@bolubakes", verified: false, followers: 5800, since: "2020-10" },
      { platform: "whatsapp", handle: "+234 803 922 4488", verified: true },
    ],
    bio: "Custom cakes + same-day delivery. Lagos mainland. Order with 24h notice.",
    photos: ["🎂", "📦"],
    credibility: 83, followers: 5800, jobs_completed: 102, avg_rating: 4.7,
    hourly_rate: 3000, response_time_min: 30,
    source: "discovered",
  },
  {
    business_name: "Hassan Math Tutor",
    category: "tutoring",
    area: "Apapa",
    social: [
      { platform: "twitter", handle: "@hassanmaths", verified: false, followers: 1200, since: "2022-09" },
      { platform: "whatsapp", handle: "+234 805 044 7711", verified: true },
    ],
    bio: "JAMB, WAEC, A-Level Maths & Physics. In-person + online. ₦5k per hour, ₦40k monthly bundle.",
    photos: ["📚", "✏️"],
    credibility: 77, followers: 1200, jobs_completed: 38, avg_rating: 4.8,
    hourly_rate: 5000, response_time_min: 60,
    source: "discovered",
  },
  {
    business_name: "Esther Cleaners Ajah",
    category: "cleaning",
    area: "Ajah",
    social: [
      { platform: "whatsapp", handle: "+234 810 555 7788", verified: true },
      { platform: "instagram", handle: "@esther.cleans", verified: false, followers: 410 },
    ],
    bio: "Routine house cleaning + AirBnB. Ajah, Sangotedo. Weekly retainer pricing.",
    photos: ["🧹"],
    credibility: 68, followers: 410, jobs_completed: 47, avg_rating: 4.5,
    hourly_rate: 3500, response_time_min: 45,
    source: "discovered",
  },
  {
    business_name: "Wahab AC Repair",
    category: "ac_hvac",
    area: "Oshodi",
    social: [
      { platform: "jiji", handle: "jiji.ng/wahab-ac", verified: true },
      { platform: "whatsapp", handle: "+234 902 600 8800", verified: true },
    ],
    bio: "AC repair, gas refill, mounting. 1-year guarantee on parts. Oshodi, Iyana, Mushin.",
    photos: ["❄️", "🔧"],
    credibility: 76, followers: 0, jobs_completed: 91, avg_rating: 4.6,
    hourly_rate: 5500, response_time_min: 30,
    source: "discovered",
  },
  {
    business_name: "Ada Web Dev",
    category: "graphic_design",
    area: "Magodo",
    social: [
      { platform: "twitter", handle: "@adabuilds", verified: false, followers: 6800, since: "2021-07" },
      { platform: "instagram", handle: "@ada.builds", verified: false, followers: 1200 },
    ],
    bio: "Landing pages, Webflow, Framer. SME-friendly pricing. ₦150k for a 5-page launch.",
    photos: ["💻", "🎨"],
    credibility: 85, followers: 8000, jobs_completed: 52, avg_rating: 4.9,
    hourly_rate: 12000, response_time_min: 90,
    source: "registered",
  },
  {
    business_name: "Olu Welds Naija",
    category: "carpentry",
    area: "Ibeju",
    social: [
      { platform: "instagram", handle: "@oluweldsng", verified: false, followers: 980, since: "2022-12" },
      { platform: "whatsapp", handle: "+234 814 070 9911", verified: true },
    ],
    bio: "Gates, burglary, canopies, stainless rails. Ibeju + Ajah corridor. Site visit free.",
    photos: ["🛠", "🚧"],
    credibility: 73, followers: 980, jobs_completed: 41, avg_rating: 4.5,
    hourly_rate: 7000, response_time_min: 120,
    source: "discovered",
  },
  {
    business_name: "Linda Catering Co",
    category: "other",
    area: "Lekki",
    social: [
      { platform: "instagram", handle: "@lindacateringco", verified: true, followers: 14_200, since: "2020-05" },
      { platform: "tiktok", handle: "@lindacaters", verified: false, followers: 22_500 },
      { platform: "whatsapp", handle: "+234 803 099 2244", verified: true },
    ],
    bio: "Small chops, party trays, breakfast platters. Lekki, Ajah, VI. ₦35k per tray.",
    photos: ["🍢", "🥘"],
    credibility: 91, followers: 36_700, jobs_completed: 119, avg_rating: 4.8,
    hourly_rate: 10000, response_time_min: 20,
    source: "discovered",
  },
];

// Comment templates by category so reviews feel real
const COMMENT_TEMPLATES = [
  { text: "Showed up on time, fixed it first try. Will hire again.", stars: 5 },
  { text: "Honest pricing, no haggling. ₦ goes to who he said it goes to.", stars: 5 },
  { text: "Quality work but came 1 hour late. Still happy.", stars: 4 },
  { text: "Replied on WhatsApp in 5 minutes, came same day.", stars: 5 },
  { text: "He sabi the work die. Recommended.", stars: 5 },
  { text: "Decent. Job took longer than estimated.", stars: 4 },
  { text: "Best in Lagos. Don't go anywhere else.", stars: 5 },
  { text: "Professional and clean. Used the Squadco escrow option — smooth.", stars: 5 },
  { text: "Tools came correctly. Cleaned up after.", stars: 5 },
  { text: "Charged a callout but explained upfront. Fair guy.", stars: 4 },
];

const COMMENTER_NAMES = ["Tope O.", "Adaeze N.", "Wale A.", "Ifeoma E.", "Bola K.", "Ngozi U.", "Dele B.", "Fatima Y.", "Joy I.", "Kayode S.", "Chika A.", "Habiba M."];

// Deterministic pseudo-random — same seed = same output across rebuilds.
function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const FIRST_NAMES = [
  "Tunde", "Aisha", "Chioma", "Emeka", "Folake", "Musa", "Bola", "Ada", "Kunle", "Tope",
  "Yetunde", "Segun", "Ngozi", "Bukola", "Wale", "Funke", "Ibrahim", "Sade", "Dele", "Joy",
  "Kayode", "Habiba", "Tobi", "Ifeoma", "Bayo", "Hassan", "Naomi", "Olu", "Linda", "Funmi",
  "Chinedu", "Bisi", "Tayo", "Kemi", "Yemi", "Fatima", "Olamide", "Damilola", "Halima", "Uche",
  "Lekan", "Seun", "Nneka", "Lola", "Tunji", "Tola", "Rasheed", "Adaeze", "Mide", "Tochi",
  "Femi", "Bimpe", "Wahab", "Esther", "Saheed", "Maryam", "Sodiq", "Abiola", "Chuka", "Sanjay",
];

const LAST_INITIALS = ["A.", "B.", "C.", "E.", "F.", "G.", "I.", "K.", "L.", "M.", "N.", "O.", "P.", "S.", "T.", "U.", "W.", "Y."];

const BUSINESS_SUFFIXES = [
  "Services", "& Sons", "Hub", "Pro", "Naija", "Lagos", "Co.", "Studio", "Works", "Crew",
  "Solutions", "& Co.", "Network", "Express", "Plus", "Premium", "Direct", "Now",
];

const BIO_TEMPLATES: Record<string, string[]> = {
  generator: ["Tiger, Sumec, Honda. Repairs + service. Same-day callouts.", "5+ years generator repair. Mobile workshop. Fair pricing."],
  ac_hvac: ["Split AC, central. Installation + gas refill. Fast response.", "Deep clean + repair. 1-year guarantee on parts."],
  plumbing: ["Pipes, sinks, toilets, water heaters. Tools-on-site.", "POP ceiling work + pipe repairs. Reasonable rates."],
  electrical: ["House wiring, inverter installs, solar consults.", "Lighting, sockets, breaker panels. Lagos mainland."],
  cleaning: ["Routine + deep cleaning. AirBnB turnaround.", "Eco products. Weekly retainer pricing available."],
  carpentry: ["Wardrobes, doors, bookshelves. Custom workshop.", "Furniture + repairs. Delivery + assembly included."],
  painting: ["Interior + exterior. Texture finishes. Free quote.", "Wall paint + screed. 2-coat standard."],
  tiling: ["Bathrooms, kitchens, full-floor. Per-sqm pricing.", "Ceramic, porcelain, marble. 5-year workmanship warranty."],
  hairstyling: ["Home service braids, weaves, wigs. Bridal packages.", "Retouch + styling. Walk-ins welcome."],
  tailoring: ["Native, casual, bridal. Pickup + delivery.", "48h rush turnaround available."],
  photography: ["Weddings, portraits, brand shoots.", "Studio + on-location. Drone available."],
  data_entry: ["Spreadsheet cleanup, SKU catalogue, transcription.", "Per-row or hourly. Remote-friendly."],
  graphic_design: ["Brand identity, IG content, logo packs.", "Landing pages, social graphics. Quick turnaround."],
  social_media: ["IG + TikTok management for SMEs.", "Content calendars, captions, monthly reports."],
  transcription: ["Audio-to-text, podcast transcripts.", "English + pidgin. 24h turnaround."],
  tutoring: ["JAMB, WAEC, A-Level Maths + Physics.", "In-person + online. Hourly + monthly bundles."],
  errand: ["Same-day pickups, market runs.", "Bike fleet. Lagos-wide coverage."],
  delivery: ["Same-day intra-Lagos delivery.", "Fragile + bulky items. Insurance available."],
  other: ["Reliable service across Lagos.", "Fair pricing, on-time delivery."],
};

const CATEGORY_PHOTO_POOL: Record<string, string[]> = {
  generator: ["⚡", "🔧", "🛠"],
  ac_hvac: ["❄️", "🧰", "🪛"],
  plumbing: ["🔧", "🚿", "🚰"],
  electrical: ["💡", "🔌", "⚡"],
  cleaning: ["🧹", "🪣", "🧼"],
  carpentry: ["🪚", "🪑", "🚪"],
  painting: ["🎨", "🖌️", "🪣"],
  tiling: ["🟫", "🛠", "📐"],
  hairstyling: ["💇", "💅", "👰"],
  tailoring: ["🪡", "👗", "📏"],
  photography: ["📸", "🎬", "🎥"],
  data_entry: ["⌨️", "📊", "💻"],
  graphic_design: ["🎨", "🖌️", "💻"],
  social_media: ["📱", "📊", "💬"],
  transcription: ["🎧", "⌨️", "📝"],
  tutoring: ["📚", "✏️", "🧮"],
  errand: ["🛵", "📦", "🛍"],
  delivery: ["🚐", "📦", "🛵"],
  other: ["🛠", "🧰"],
};

const PROC_CATEGORIES = Object.keys(BIO_TEMPLATES);

function buildHandle(rand: () => number, slug: string, platform: string) {
  const suffixes = ["_ng", "lagos", "_official", "hq", "_ng_", "_co", ""];
  const sfx = suffixes[Math.floor(rand() * suffixes.length)];
  return platform === "whatsapp"
    ? "+234 " + String(800 + Math.floor(rand() * 100)) + " " + String(100 + Math.floor(rand() * 900)) + " " + String(1000 + Math.floor(rand() * 9000))
    : "@" + slug + sfx;
}

function generateProceduralArtisans(count: number): DiscoverySeed[] {
  const rand = rng(42_424_242);
  const out: DiscoverySeed[] = [];
  const areas = Object.keys(LAGOS_AREAS) as (keyof typeof LAGOS_AREAS)[];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const initial = LAST_INITIALS[Math.floor(rand() * LAST_INITIALS.length)];
    const suffix = BUSINESS_SUFFIXES[Math.floor(rand() * BUSINESS_SUFFIXES.length)];
    const category = PROC_CATEGORIES[Math.floor(rand() * PROC_CATEGORIES.length)];
    const area = areas[Math.floor(rand() * areas.length)];
    const bn = `${first} ${initial} ${suffix}`;
    const slug = (first + suffix).toLowerCase().replace(/[^a-z]/g, "").slice(0, 14);
    const credibility = 55 + Math.floor(rand() * 44); // 55-98
    const rating = +(3.6 + rand() * 1.4).toFixed(1); // 3.6-5.0
    const jobs = 8 + Math.floor(rand() * 220); // 8-227
    const followers = Math.floor(rand() * 30_000);
    const hourlyRate = [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6500, 7500, 8500, 10000, 12000, 15000][Math.floor(rand() * 14)];
    const responseTime = [10, 15, 20, 25, 30, 40, 45, 60, 75, 90, 120][Math.floor(rand() * 11)];
    const socialCount = 1 + Math.floor(rand() * 3); // 1-3 socials
    const platforms: ("instagram" | "whatsapp" | "tiktok" | "twitter" | "facebook" | "jiji")[] = ["instagram", "whatsapp", "tiktok", "twitter", "facebook", "jiji"];
    const chosen: typeof platforms = [];
    for (let s = 0; s < socialCount; s++) {
      const p = platforms[Math.floor(rand() * platforms.length)];
      if (!chosen.includes(p)) chosen.push(p);
    }
    const social: SocialHandle[] = chosen.map((p) => ({
      platform: p,
      handle: buildHandle(rand, slug, p),
      verified: rand() > 0.55,
      followers: p === "whatsapp" ? undefined : Math.floor(rand() * (followers + 200)),
      since: `20${18 + Math.floor(rand() * 7)}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}`,
    }));
    const source: "discovered" | "registered" | "claimed" = rand() > 0.78 ? "registered" : rand() > 0.92 ? "claimed" : "discovered";
    const bios = BIO_TEMPLATES[category] || BIO_TEMPLATES.other;
    const photos = CATEGORY_PHOTO_POOL[category] || CATEGORY_PHOTO_POOL.other;

    out.push({
      business_name: bn,
      category,
      area,
      social,
      bio: bios[Math.floor(rand() * bios.length)],
      photos,
      credibility,
      followers,
      jobs_completed: jobs,
      avg_rating: rating,
      hourly_rate: hourlyRate,
      response_time_min: responseTime,
      source,
    });
  }
  return out;
}

async function seedFrom(seeds: DiscoverySeed[]) {
  await mutateAndPersist((db) => {
    for (const s of seeds) {
      const [lat, lng] = LAGOS_AREAS[s.area];
      const uid = id("u");
      const phone = "+234" + (800 + Math.floor(Math.random() * 100)) + String(Math.floor(1000000 + Math.random() * 9000000)).slice(0, 7);
      const accountName = s.account_name || s.business_name.toUpperCase().replace(/[^A-Z\s]/g, "").trim();
      const acctMatch = nameMatchScore(s.business_name, accountName);
      const sinceMonths = s.social.map((h) => h.since).filter(Boolean).map((d) => {
        const [y, m] = d!.split("-").map(Number);
        return Math.max(0, (new Date().getFullYear() - y) * 12 + (new Date().getMonth() + 1 - m));
      });
      const oldestSocialMonths = sinceMonths.length ? Math.max(...sinceMonths) : 0;

      db.users.push({
        id: uid,
        phone,
        name: accountName,
        business_name: s.business_name,
        role: "worker",
        kyc_tier: s.source === "registered" ? 3 : 0,
        liveness_passed: s.source === "registered",
        bank_code: s.bank_code || "058",
        account_number: "01" + String(Math.floor(10000000 + Math.random() * 89999999)).slice(0, 8),
        account_name: accountName,
        area: s.area,
        bio: s.bio,
        skills: [s.category],
        source: s.source,
        discovered_at: s.source === "discovered" ? Date.now() - Math.floor(Math.random() * 60) * 86400000 : undefined,
        claimed: s.source !== "discovered",
        geo: { lat: jitter(lat), lng: jitter(lng), precision: "area" },
        social_handles: s.social,
        business_photos: s.photos,
        service_radius_km: 8 + Math.floor(Math.random() * 12),
        likes: Math.floor(s.credibility * 4 + Math.random() * 80),
        followers: s.followers,
        credibility: s.credibility,
        hourly_rate: s.hourly_rate,
        response_time_min: s.response_time_min,
        jara_score: s.source === "registered" ? Math.min(820, 580 + s.jobs_completed * 1.6) : 0,
        jobs_completed: s.jobs_completed,
        avg_rating: s.avg_rating,
        on_time_rate: 0.85 + Math.random() * 0.13,
        disputes: Math.random() > 0.85 ? 1 : 0,
        fraud_signals: {
          nin_matches_bvn: s.source === "registered" ? true : undefined,
          account_name_match_score: acctMatch,
          account_age_days: Math.max(180, oldestSocialMonths * 30 + Math.floor(Math.random() * 365)),
          social_age_days: oldestSocialMonths * 30,
          device_reuse_count: 0,
          geo_state_consistency: true,
          squad_tx_count: s.source === "registered" ? Math.floor(s.jobs_completed * 0.7) : 0,
          last_check: Date.now() - Math.floor(Math.random() * 7) * 86400000,
        },
        created_at: Date.now() - Math.floor(60 + Math.random() * 720) * 86400000,
      });

      // Seed reviews for credibility
      const reviewCount = Math.max(3, Math.floor(s.jobs_completed * 0.18));
      for (let i = 0; i < Math.min(reviewCount, 12); i++) {
        const t = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];
        db.comments.push({
          id: id("c"),
          target_id: uid,
          author_name: COMMENTER_NAMES[Math.floor(Math.random() * COMMENTER_NAMES.length)],
          author_handle: Math.random() > 0.4 ? undefined : "@" + (COMMENTER_NAMES[Math.floor(Math.random() * COMMENTER_NAMES.length)].split(" ")[0].toLowerCase()),
          text: t.text,
          stars: t.stars,
          likes: Math.floor(Math.random() * 24),
          source: (["in_app", "instagram", "google", "jiji"][Math.floor(Math.random() * 4)]) as Comment["source"],
          created_at: Date.now() - Math.floor(Math.random() * 90) * 86400000,
        });
      }
    }
  });
}

export async function seedDiscovery() {
  const db = await ensureHydrated();

  // Count business artisans currently visible in the cache. The previous
  // implementation gated on an in-memory `__proc_seeded` flag, which got
  // wiped on every cold lambda — so every cold start re-ran the seed and
  // pushed another 260 procedural rows into Supabase. The users table grew
  // unbounded that way (3933 rows in production by the time we caught it).
  //
  // Replacing the flag with an empirical count makes the seed idempotent:
  // once the discovery population is healthy, this is a no-op forever.
  // Even with Supabase's 1000-row default page limit on hydration, a properly
  // seeded DB yields far more than the threshold here.
  const businessCount = db.users.filter((u) => u.business_name).length;

  if (businessCount >= 50) return;

  if (businessCount === 0) {
    await seedFrom([...SEED, ...generateProceduralArtisans(260)]);
    return;
  }

  // Some curated rows present (e.g. an old partial run) but no procedural
  // top-up. Add procedural once; the threshold above prevents repeats.
  await seedFrom(generateProceduralArtisans(260));
}
