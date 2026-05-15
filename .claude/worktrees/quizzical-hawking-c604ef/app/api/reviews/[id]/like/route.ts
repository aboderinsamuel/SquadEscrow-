import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutate } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  let result: { liked: boolean; n: number } = { liked: false, n: 0 };
  mutate((db) => {
    const c = db.comments.find((x) => x.id === params.id);
    if (!c) return;
    c.likes = (c.likes || 0) + 1;
    result = { liked: true, n: c.likes };
  });
  return NextResponse.json({ ok: true, ...result });
}
