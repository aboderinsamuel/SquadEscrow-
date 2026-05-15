import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { mutate } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { name, role } = await req.json();
  mutate((db) => {
    const u = db.users.find((x) => x.id === me.id);
    if (!u) return;
    if (name) u.name = String(name).slice(0, 80);
    if (role === "worker" || role === "customer" || role === "both") u.role = role;
  });
  return NextResponse.json({ ok: true });
=======
import { mutateAndPersist } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const me = await await getSessionUser();
    if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
    const { name, role } = await req.json();
    await mutateAndPersist((db) => {
      const u = db.users.find((x) => x.id === me.id);
      if (!u) return;
      if (name) u.name = String(name).slice(0, 80);
      if (role === "worker" || role === "customer" || role === "both") u.role = role;
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[/api/auth/profile] uncaught:", e);
    return NextResponse.json({ ok: false, error: "server_error", detail: e?.message || String(e) }, { status: 500 });
  }
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
}
