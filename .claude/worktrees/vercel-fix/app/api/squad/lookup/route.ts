import { NextRequest, NextResponse } from "next/server";
import { accountLookup } from "@/lib/squad";

export async function POST(req: NextRequest) {
  const { bank_code, account_number } = await req.json();
  if (!bank_code || !account_number) return NextResponse.json({ ok: false, error: "missing_params" }, { status: 400 });
  const r = await accountLookup({ bank_code, account_number });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 502 });
  return NextResponse.json({ ok: true, account_name: r.account_name, source: r.source });
}
