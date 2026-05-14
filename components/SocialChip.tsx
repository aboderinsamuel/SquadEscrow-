import { cn } from "@/lib/utils";

type Platform = "instagram" | "whatsapp" | "twitter" | "tiktok" | "facebook" | "jiji" | "google";

const meta: Record<Platform, { label: string; bg: string; text: string; icon: React.ReactNode; href?: (h: string) => string }> = {
  instagram: {
    label: "Instagram",
    bg: "bg-coral-500", text: "text-cream-50",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>,
    href: (h) => `https://instagram.com/${h.replace(/^@/, "")}`,
  },
  whatsapp: {
    label: "WhatsApp",
    bg: "bg-forest-500", text: "text-cream-50",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 003 18.7L1.5 23l4.4-1.2A11 11 0 1020.5 3.5Zm-8.4 17a8.6 8.6 0 01-4.6-1.3l-.3-.2-2.6.7.7-2.5-.2-.3a8.6 8.6 0 1116 4.5 8.5 8.5 0 01-9 .1z"/></svg>,
    href: (h) => `https://wa.me/${h.replace(/[^0-9]/g, "")}`,
  },
  twitter: {
    label: "X / Twitter",
    bg: "bg-ink", text: "text-cream-50",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 3H21l-6.6 7.5L22 21h-6l-4.7-6.2L5.9 21H3l7.1-8L2.4 3h6.2l4.3 5.7L18.3 3z"/></svg>,
    href: (h) => `https://x.com/${h.replace(/^@/, "")}`,
  },
  tiktok: {
    label: "TikTok",
    bg: "bg-ink", text: "text-cream-50",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8.6c-2 0-3.8-1.2-4.6-2.9V15a6 6 0 11-6-6v3a3 3 0 103 3V2h3.3c.4 2.6 2.5 4.6 5 4.9v1.7z"/></svg>,
    href: (h) => `https://tiktok.com/${h.startsWith("@") ? h : "@" + h}`,
  },
  facebook: {
    label: "Facebook",
    bg: "bg-ink", text: "text-cream-50",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9V14.9H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7a10 10 0 008.5-9.9z"/></svg>,
  },
  jiji: {
    label: "Jiji.ng",
    bg: "bg-gold-400", text: "text-ink",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 7v6a3 3 0 11-6 0" fill="#FDF8EF"/></svg>,
    href: (h) => `https://${h.startsWith("http") ? h : h}`,
  },
  google: {
    label: "Google",
    bg: "bg-cream-50", text: "text-ink",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.1h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 2.9-4.3 2.9-7.4z"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0012 22z"/><path d="M6.4 14a6 6 0 010-3.8V7.6H3.1a10 10 0 000 8.8L6.4 14z"/><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8C17 3 14.7 2 12 2A10 10 0 003.1 7.6L6.4 10C7.2 7.6 9.4 5.9 12 5.9z"/></svg>,
  },
};

export function SocialChip({ platform, handle, verified, followers, compact }: { platform: Platform; handle: string; verified?: boolean; followers?: number; compact?: boolean }) {
  const m = meta[platform] || meta.facebook;
  const href = m.href ? m.href(handle) : undefined;
  const content = (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-ink/10", m.bg, m.text, compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-[12px]")}>
      <span className="inline-flex items-center">{m.icon}</span>
      <span className="truncate max-w-[140px]">{handle}</span>
      {verified && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-label="verified">
          <path d="M12 2l2.4 1.7 2.9-.2.8 2.8 2.2 1.9-1.3 2.6.4 2.9-2.7 1.1-1.6 2.4-2.9-.4-2.6 1.3L7.7 17l-2.6-1.3-1.1-2.7L1.5 12l1.7-2.4L3 6.8l2.8-.8L7.7 3.8 10.6 4 12 2z" />
        </svg>
      )}
      {!compact && followers && followers > 0 && (
        <span className="opacity-70 font-medium">· {followers >= 1000 ? `${(followers/1000).toFixed(1)}k` : followers}</span>
      )}
    </span>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition">{content}</a>;
  return content;
}
