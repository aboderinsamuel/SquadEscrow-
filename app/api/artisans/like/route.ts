import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutate } from "@/lib/db";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { target_id, liked } = await req.json();
  if (!target_id) return NextResponse.json({ ok: false, error: "missing_target" }, { status: 400 });
  mutate((db) => {
    const idx = db.likes.findIndex((l) => l.user_id === me.id && l.target_id === target_id);
    const u = db.users.find((u) => u.id === target_id);
    if (liked && idx === -1) {
      db.likes.push({ user_id: me.id, target_id, created_at: Date.now() });
      if (u) u.likes = (u.likes || 0) + 1;
    } else if (!liked && idx !== -1) {
      db.likes.splice(idx, 1);
      if (u) u.likes = Math.max(0, (u.likes || 0) - 1);
    }
  });
  return NextResponse.json({ ok: true });
}
