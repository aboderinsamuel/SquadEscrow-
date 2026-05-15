import { NextRequest, NextResponse } from "next/server";
import { mutate, readDB } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

function normalizePhone(p: string) {
  const digits = (p || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("234")) return "+" + digits;
  if (digits.startsWith("0")) return "+234" + digits.slice(1);
  if (digits.startsWith("8") || digits.startsWith("7") || digits.startsWith("9")) return "+234" + digits;
  return "+" + digits;
}

export async function POST(req: NextRequest) {
  seedIfEmpty();
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ ok: false, error: "phone_required" }, { status: 400 });
  const norm = normalizePhone(phone);
  if (norm.length < 10) return NextResponse.json({ ok: false, error: "phone_invalid" }, { status: 400 });

  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const db = readDB();
  const existing = !!db.users.find((u) => u.phone === norm);

  mutate((db) => {
    db.otps[norm] = { code, expires_at: Date.now() + 10 * 60_000 };
  });

  // In prod: hit Squad VAS /vas/sms here. For demo, expose OTP via demo_otp.
  return NextResponse.json({ ok: true, existing, demo_otp: code, phone: norm });
}
