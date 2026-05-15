import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
<<<<<<< HEAD
import { mutate } from "@/lib/db";
=======
import { mutateAndPersist } from "@/lib/db";
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  let result: { liked: boolean; n: number } = { liked: false, n: 0 };
<<<<<<< HEAD
  mutate((db) => {
=======
  await mutateAndPersist((db) => {
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
    const c = db.comments.find((x) => x.id === params.id);
    if (!c) return;
    c.likes = (c.likes || 0) + 1;
    result = { liked: true, n: c.likes };
  });
  return NextResponse.json({ ok: true, ...result });
}
