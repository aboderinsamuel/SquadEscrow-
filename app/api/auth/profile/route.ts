import { NextRequest, NextResponse } from "next/server";
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
}
