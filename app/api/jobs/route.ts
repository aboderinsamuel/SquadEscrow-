import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mutateAndPersist, id } from "@/lib/db";

const allowedCats = new Set(["generator","plumbing","electrical","ac_hvac","carpentry","painting","tiling","cleaning","errand","delivery","hairstyling","tailoring","photography","data_entry","graphic_design","social_media","transcription","tutoring","other"]);

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "unauth" }, { status: 401 });
  const { title, description, category, amount, area, urgency } = await req.json();
  if (!title || !description || !category || !amount) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  if (!allowedCats.has(category)) return NextResponse.json({ ok: false, error: "bad_category" }, { status: 400 });
  if (typeof amount !== "number" || amount < 500) return NextResponse.json({ ok: false, error: "bad_amount" }, { status: 400 });

  const jobId = id("j");
  // mutateAndPersist (not mutate) — on Vercel, fire-and-forget process.nextTick
  // flushes get dropped when the lambda freezes after the response goes out,
  // and the redirect to /app/jobs/<id>?fund=1 then 404s on the next lambda
  // because Supabase never received the row.
  await mutateAndPersist((db) => {
    db.jobs.push({
      id: jobId,
      customer_id: me.id,
      title: String(title).slice(0, 100),
      description: String(description).slice(0, 600),
      category,
      amount: Math.round(amount),
      area: String(area || "Lagos").slice(0, 80),
      urgency: urgency === "today" || urgency === "this_week" || urgency === "flexible" ? urgency : "flexible",
      state: "POSTED",
      created_at: Date.now(),
    });
  });

  return NextResponse.json({ ok: true, job_id: jobId });
}
