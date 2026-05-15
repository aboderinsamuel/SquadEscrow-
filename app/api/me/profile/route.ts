import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
<<<<<<< HEAD
import { mutate } from "@/lib/db";
=======
import { mutateAndPersist } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { name, area, bio, skills, hourly_rate, business_name } = body || {};

<<<<<<< HEAD
  mutate((db) => {
=======
  await mutateAndPersist((db) => {
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
    const u = db.users.find((x) => x.id === me.id);
    if (!u) return;
    if (typeof name === "string") u.name = name.slice(0, 80).trim() || u.name;
    if (typeof area === "string") u.area = area.slice(0, 80).trim();
    if (typeof bio === "string") u.bio = bio.slice(0, 400);
    if (Array.isArray(skills)) u.skills = skills.filter((s) => typeof s === "string").slice(0, 12);
    if (typeof hourly_rate === "number" && hourly_rate >= 0) u.hourly_rate = hourly_rate;
    if (typeof business_name === "string") u.business_name = business_name.slice(0, 80).trim() || u.business_name;
  });

  return NextResponse.json({ ok: true });
}
