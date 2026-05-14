# Reel videos

Drop your 4 mp4 files here as `1.mp4`, `2.mp4`, `3.mp4`, `4.mp4`. They power
the Discover Reels carousel and the full-screen reels viewer. The cycle is
1 → 2 → 3 → 4 → 1 → … so the order matters for storytelling.

## Recommended encode

Smaller + faster start on mobile + Vercel edge CDN:

```bash
ffmpeg -i input.mov \
  -vcodec libx264 \
  -preset slow \
  -crf 24 \
  -movflags +faststart \
  -vf "scale=720:-2,fps=30" \
  -an \
  1.mp4
```

- `+faststart` moves the MOOV atom to the front — video starts playing on
  the first chunk instead of waiting for the whole file. Critical.
- `-an` drops audio (reels autoplay muted anyway, so audio is dead weight).
- 720p is enough for portrait reels; double the bitrate if you need 1080p.

Keep each file under ~7 MB if you can. Vercel serves these from its edge
CDN with HTTP range requests — first frame typically lands in <100 ms.
