/**
 * BitmojiAvatar — Snapchat-style cartoon avatars via DiceBear (free, no key).
 *
 * Renders a deterministic cartoon character based on a seed (name/id). Used on
 * the map for Snap-Map-style provider pins and on profile cards where we want
 * personality instead of initials.
 *
 * Default style: `notionists` — cute illustrated characters with hair,
 * accessories, and outfits. Compatible with our cream/coral palette.
 */
type Style = "notionists" | "personas" | "adventurer" | "big-smile" | "lorelei" | "thumbs";

const BG_PALETTE = ["F4ECDF", "E04848", "F0A04A", "3E8E5C", "0E2A1F", "FBE2BD"];

function pickBg(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return BG_PALETTE[Math.abs(h) % BG_PALETTE.length];
}

export function bitmojiUrl(seed: string, style: Style = "notionists", size = 96, bgOverride?: string) {
  const bg = bgOverride || pickBg(seed);
  const s = encodeURIComponent(seed);
  // Public CDN, no API key, deterministic SVG output
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${s}&backgroundColor=${bg}&radius=50&size=${size}`;
}

interface Props {
  seed: string;
  size?: number;
  style?: Style;
  bg?: string;
  className?: string;
  ring?: boolean;
  online?: boolean;
}

export function BitmojiAvatar({ seed, size = 56, style = "notionists", bg, className, ring, online }: Props) {
  const url = bitmojiUrl(seed, style, size, bg);
  return (
    <span className={"relative inline-block shrink-0 " + (className || "")} style={{ width: size, height: size }}>
      <img
        src={url}
        alt={seed}
        width={size}
        height={size}
        className={"rounded-full block " + (ring ? "ring-[3px] ring-cream-50 shadow-card" : "")}
        loading="lazy"
        draggable={false}
      />
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-forest-500 ring-2 ring-cream-50" />
      )}
    </span>
  );
}
