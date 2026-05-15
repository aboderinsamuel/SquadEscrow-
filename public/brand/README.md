# SquadcoEscrow brand assets

Exported from `components/Logo.tsx`. SVGs scale to any resolution losslessly.

## Files

| File | Use it for |
|---|---|
| `logo-mark-light.svg` | Icon only, on light backgrounds (cream/white). Favicon, app icon, social avatar. |
| `logo-mark-dark.svg` | Icon only, on dark backgrounds (ink/black). Dark-mode UIs, slide title cards. |
| `logo-lockup-light.svg` | Full lockup (icon + "Squadco / escrow" wordmark), light background. Slide title cards, business cards. |
| `logo-lockup-dark.svg` | Full lockup, dark background. Pitch deck cover, video lower-thirds. |

## Brand colours

| Token | Hex | Use |
|---|---|---|
| Ink | `#0A0A0A` | Primary dark, text on light |
| Cream | `#FDF8EF` | Primary light, text on dark |
| Coral | `#E04848` | The escrow-locked indicator dot. Never use as primary type colour. |
| Forest 500 | `#3E8E5C` | Success, settled states |
| Gold 400 | `#F0A04A` | Accents, highlights |

## Typography

Inter — Bold (700) for "Squadco", Medium (500) for "/ escrow". Tracking is tight (`-0.04em` for the wordmark).

## Converting to PNG / JPG

These SVGs open natively in Figma, Keynote, PowerPoint, Google Slides, CapCut, and Adobe apps.

If a tool insists on a raster file:
- **Mac:** open the SVG in Preview → Export As → PNG/JPG.
- **Windows:** drag the SVG into Figma (free) → Export as PNG @ 2× or 4×.
- **CLI:** `npx svgexport logo-mark-light.svg out.png 1024:`.
- **Online:** cloudconvert.com (no signup needed).

## Live URL

Once deployed, every asset is served at:
- `https://squadcoescrow.vercel.app/brand/logo-mark-light.svg`
- `https://squadcoescrow.vercel.app/brand/logo-mark-dark.svg`
- `https://squadcoescrow.vercel.app/brand/logo-lockup-light.svg`
- `https://squadcoescrow.vercel.app/brand/logo-lockup-dark.svg`

Right-click → Save As to grab them directly from the deployed site.
