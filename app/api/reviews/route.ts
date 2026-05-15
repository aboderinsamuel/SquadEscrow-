import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
<<<<<<< HEAD
import { mutate, id, readDB } from "@/lib/db";
=======
import { mutateAndPersist, id, readDB } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
import type { Comment } from "@/lib/types";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { target_id, text, stars } = await req.json();
  if (!target_id || !text) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  const db = readDB();
  const tgt = db.users.find((u) => u.id === target_id);
  if (!tgt) return NextResponse.json({ ok: false, error: "no_target" }, { status: 404 });

  const c: Comment = {
    id: id("c"),
    target_id,
    author_id: me.id,
    author_name: me.name || "Anonymous",
    text: String(text).slice(0, 800),
    stars: stars ? Math.max(1, Math.min(5, Math.round(stars))) : undefined,
    likes: 0,
    source: "in_app",
    created_at: Date.now(),
  };

<<<<<<< HEAD
  mutate((db) => {
=======
  await mutateAndPersist((db) => {
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
    db.comments.push(c);
    // Recompute avg_rating quickly
    const inApp = db.comments.filter((x) => x.target_id === target_id && x.stars);
    const u = db.users.find((u) => u.id === target_id);
    if (u && inApp.length) u.avg_rating = inApp.reduce((s, x) => s + (x.stars || 0), 0) / inApp.length;
  });

  return NextResponse.json({ ok: true, comment: c });
}
