import { NextRequest, NextResponse } from "next/server";
import { mutate } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { name, role } = await req.json();
  mutate((db) => {
    const u = db.users.find((x) => x.id === me.id);
    if (!u) return;
    if (name) u.name = String(name).slice(0, 80);
    if (role === "worker" || role === "customer" || role === "both") u.role = role;
  });
  return NextResponse.json({ ok: true });
}
