import { NextRequest, NextResponse } from "next/server";
import { mutate, ensureHydrated } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { sendSquadSms, isLive } from "@/lib/squad";

function normalizePhone(p: string) {
  const digits = (p || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("234")) return "+" + digits;
  if (digits.startsWith("0")) return "+234" + digits.slice(1);
  if (digits.startsWith("8") || digits.startsWith("7") || digits.startsWith("9")) return "+234" + digits;
  return "+" + digits;
}

export async function POST(req: NextRequest) {
  try {
    // Wait for Supabase hydration if we're in the cold-start race window.
    // On Vercel the filesystem is read-only so the JSON fallback can't run;
    // we MUST have the in-memory cache populated before mutating.
    const db = await ensureHydrated();
    seedIfEmpty();

    let body: any = null;
    try { body = await req.json(); } catch {}
    const phone = body?.phone;
    if (!phone) return NextResponse.json({ ok: false, error: "phone_required" }, { status: 400 });
    const norm = normalizePhone(phone);
    if (norm.length < 10) return NextResponse.json({ ok: false, error: "phone_invalid" }, { status: 400 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = !!db.users.find((u) => u.phone === norm);

    mutate((d) => {
      d.otps[norm] = { code, expires_at: Date.now() + 10 * 60_000 };
    });

    // Send via Squad VAS SMS if we have keys. Fall back to on-screen demo OTP if:
    //   1. We're in mock mode (no keys)
    //   2. Squad refuses (e.g. Sender ID not registered for this merchant)
    let smsStatus: "live" | "live-fallback" | "mock" = "mock";
    let smsNote: string | undefined;
    if (isLive) {
      try {
        const sms = await sendSquadSms({
          to: norm,
          body: `${code} is your Squadco Escrow verification code. Expires in 10 minutes.`,
        });
        smsStatus = sms.ok && sms.source === "live" ? "live" : "live-fallback";
        smsNote = (sms as any).note;
      } catch (e: any) {
        smsStatus = "live-fallback";
        smsNote = e?.message || "Squad SMS call threw";
      }
    }

    const showDemoOtp = smsStatus !== "live";

    return NextResponse.json({
      ok: true,
      existing,
      phone: norm,
      sms: smsStatus,
      sms_note: smsNote,
      demo_otp: showDemoOtp ? code : undefined,
    });
  } catch (e: any) {
    // Last line of defence — always return JSON so the client doesn't choke
    // on an HTML error page from Vercel.
    console.error("[/api/auth/otp] uncaught:", e);
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message || String(e) },
      { status: 500 },
    );
  }
}
