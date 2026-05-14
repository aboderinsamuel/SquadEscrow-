import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function naira(n: number) {
  return "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export function shortNaira(n: number) {
  if (n >= 1_000_000_000) return "₦" + (n / 1_000_000_000).toFixed(1) + "bn";
  if (n >= 1_000_000) return "₦" + (n / 1_000_000).toFixed(1) + "m";
  if (n >= 1_000) return "₦" + Math.round(n / 1_000) + "k";
  return "₦" + n;
}

export function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export const categoryEmoji: Record<string, string> = {
  generator: "⚡",
  plumbing: "🔧",
  electrical: "💡",
  ac_hvac: "❄️",
  carpentry: "🪚",
  painting: "🎨",
  tiling: "🟫",
  cleaning: "🧹",
  errand: "🛵",
  delivery: "📦",
  hairstyling: "💇",
  tailoring: "🪡",
  photography: "📸",
  data_entry: "⌨️",
  graphic_design: "🖌️",
  social_media: "📱",
  transcription: "🎧",
  tutoring: "📚",
  other: "✨",
};

export const categoryLabel: Record<string, string> = {
  generator: "Generator repair",
  plumbing: "Plumbing",
  electrical: "Electrical",
  ac_hvac: "AC / HVAC",
  carpentry: "Carpentry",
  painting: "Painting",
  tiling: "Tiling / POP",
  cleaning: "Cleaning",
  errand: "Errand runner",
  delivery: "Delivery",
  hairstyling: "Hairstyling",
  tailoring: "Tailoring",
  photography: "Photography",
  data_entry: "Data entry",
  graphic_design: "Graphic design",
  social_media: "Social media",
  transcription: "Transcription",
  tutoring: "Tutoring",
  other: "Other",
};

export function stateColor(s: string) {
  switch (s) {
    case "POSTED": return "bg-ink/8 text-ink/60 ring-ink/10";
    case "FUNDED": return "bg-forest-500 text-cream-50 ring-forest-600";
    case "ASSIGNED": return "bg-gold-400 text-ink ring-gold-500";
    case "IN_PROGRESS": return "bg-gold-300 text-ink ring-gold-400";
    case "WORKER_COMPLETED": return "bg-forest-300 text-ink ring-forest-400";
    case "SETTLED": return "bg-forest-700 text-cream-50 ring-forest-800";
    case "DISPUTED": return "bg-coral-500 text-cream-50 ring-coral-600";
    case "CANCELLED": return "bg-ink/8 text-ink/40 ring-ink/10";
    default: return "bg-ink/8 text-ink/55 ring-ink/10";
  }
}

export function stateLabel(s: string) {
  return s.toLowerCase().replace(/_/g, " ");
}
