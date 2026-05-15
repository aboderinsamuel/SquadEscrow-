import crypto from "node:crypto";

// ─── Squad sandbox status (verified May 2026 against merchant SBHPM24ZVH) ───
// ✅ /merchant/balance?currency_id=NGN              — works
// ✅ /payout/account/lookup (bank_code = 6-digit NIP) — works
// ✅ /virtual-account/merchant/transactions          — works (listing)
// ⚠️  /payout/transfer                                — endpoint OK; merchant
//      must toggle "auto-payout" OFF on dashboard.
// ⚠️  /virtual-account/create-dynamic-virtual-account — endpoint OK but
//      merchant lacks "custom name" / "beneficiary_account" entitlements;
//      email support@squadco.com for the dynamic-VA allocation.
// ⚠️  /sms/send/instant                              — endpoint OK; merchant
//      must register a Sender ID on the dashboard. Set SQUAD_SMS_SENDER_ID.
// ❌ /transactions (legacy path)                       — 404, replaced below.
// ───────────────────────────────────────────────────────────────────────────

const BASE = process.env.SQUAD_BASE_URL || "https://sandbox-api-d.squadco.com";
const SECRET = process.env.SQUAD_SECRET_KEY || "";
const MERCHANT_ID = process.env.SQUAD_MERCHANT_ID || "SQUADCO";
const MODE_ENV = (process.env.SQUAD_MODE || "auto").toLowerCase();
// SMS Sender ID must be pre-registered with Squad on the dashboard
// (Settings → SMS Sender IDs). Until one is approved, sendSquadSms() falls back.
const SMS_SENDER_ID = process.env.SQUAD_SMS_SENDER_ID || "";

export const isLive = MODE_ENV === "live" || (MODE_ENV === "auto" && SECRET.length > 0);
export const isMock = !isLive;
export const merchantId = MERCHANT_ID;

const NG_BANKS: Record<string, string> = {
  "058": "GTBank",
  "044": "Access Bank",
  "057": "Zenith Bank",
  "011": "First Bank",
  "033": "United Bank for Africa",
  "232": "Sterling Bank",
  "070": "Fidelity Bank",
  "035": "Wema / ALAT",
  "215": "Unity Bank",
  "076": "Polaris Bank",
  "100": "OPay",
  "999991": "PalmPay",
  "100004": "Kuda",
  "50515": "Moniepoint MFB",
};

export function bankName(code: string) {
  return NG_BANKS[code] || "Unknown Bank";
}

export function bankList() {
  return Object.entries(NG_BANKS).map(([code, name]) => ({ code, name }));
}

async function callSquad<T = any>(method: "GET" | "POST" | "PATCH", path: string, body?: any): Promise<{ ok: boolean; data?: T; error?: string; raw?: string }> {
  if (!SECRET) return { ok: false, error: "no_secret" };
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!res.ok) return { ok: false, error: data?.message || `http_${res.status}`, raw: text, data };
    return { ok: true, data, raw: text };
  } catch (e: any) {
    return { ok: false, error: e?.message || "fetch_failed" };
  }
}

// VA = Dynamic Virtual Account
export async function createDynamicVA(args: {
  jobId: string;
  amountNaira: number;
  customerName: string;
  beneficiaryAccount?: string;
}) {
  const ref = `${MERCHANT_ID}-${args.jobId}`;
  if (isLive) {
    const r = await callSquad<any>("POST", "/virtual-account/create-dynamic-virtual-account", {
      transaction_ref: ref,
      amount: args.amountNaira * 100,
      currency_id: "NGN",
      customer_identifier: args.customerName,
      beneficiary_account: args.beneficiaryAccount || "0000000000",
      expiry_seconds: 3600,
    });
    if (r.ok && r.data?.data) {
      const nuban = r.data.data.virtual_account_number || r.data.data.account_number;
      return { ok: true, va: nuban as string, ref, source: "live" as const, raw: r.data };
    }
    return { ok: false, error: r.error, source: "live" as const };
  }
  // mock — deterministic NUBAN-style 10-digit number
  const seed = crypto.createHash("sha256").update(ref).digest("hex");
  const nuban = `90${seed.replace(/[^0-9]/g, "").padEnd(8, "0").slice(0, 8)}`;
  return { ok: true, va: nuban, ref, source: "mock" as const };
}

export async function accountLookup(args: { bank_code: string; account_number: string }) {
  if (isLive) {
    const r = await callSquad<any>("POST", "/payout/account/lookup", args);
    if (r.ok && r.data?.data) {
      return { ok: true, account_name: r.data.data.account_name as string, source: "live" as const };
    }
    return { ok: false, error: r.error, source: "live" as const };
  }
  // Mock name from bank + account: stable, friendly Nigerian names
  const names = ["TUNDE A. ADELEKE", "AISHA M. IBRAHIM", "CHIOMA E. OKAFOR", "EMEKA P. NWOSU", "FOLAKE B. ADEYEMI", "MUSA H. BELLO", "BLESSING U. ANYANWU"];
  const idx = parseInt(args.account_number.slice(-2) || "0", 10) % names.length;
  return { ok: true, account_name: names[idx], source: "mock" as const };
}

export async function transferPayout(args: {
  jobId: string;
  amountNaira: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  remark?: string;
}) {
  const ref = `${MERCHANT_ID}-${args.jobId}-out-${Math.floor(Date.now() / 1000)}`;
  if (isLive) {
    const r = await callSquad<any>("POST", "/payout/transfer", {
      transaction_reference: ref,
      amount: args.amountNaira * 100,
      bank_code: args.bank_code,
      account_number: args.account_number,
      account_name: args.account_name,
      currency_id: "NGN",
      remark: args.remark || `JARA ${args.jobId}`,
    });
    if (r.ok) return { ok: true, ref, source: "live" as const, raw: r.data };
    return { ok: false, error: r.error, ref, source: "live" as const };
  }
  return { ok: true, ref, source: "mock" as const };
}

export async function walletBalance() {
  if (isLive) {
    // Squad requires ?currency_id=NGN on this endpoint, otherwise it 400s with
    // "currency_id is required" (verified empirically May 2026).
    const r = await callSquad<any>("GET", "/merchant/balance?currency_id=NGN");
    if (r.ok && r.data?.data) return { ok: true, balance: Number(r.data.data.AvailableBalance || r.data.data.available_balance || 0) / 100, source: "live" as const, raw: r.data };
    return { ok: false, error: r.error, source: "live" as const };
  }
  return { ok: true, balance: 8_400_000, source: "mock" as const };
}

// ── VAS · SMS (for OTP delivery) ───────────────────────────────────────
// Endpoint: POST /sms/send/instant per docs.squadco.com/Value-added-services/SMS/message
// Body shape: { sender_id, messages: [{ phone_number, message }] }
// Two prerequisites:
//   1. SQUAD_SMS_SENDER_ID env var must match a Sender ID registered on the
//      Squad dashboard (Settings → SMS Sender IDs).
//   2. Phone number format expected by Squad is local Nigerian (08064834011),
//      not +234... — we normalise here.
function toLocalMsisdn(p: string) {
  const digits = (p || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("234")) return "0" + digits.slice(3);
  if (digits.startsWith("0")) return digits;
  if (/^[789]/.test(digits)) return "0" + digits;
  return digits;
}

export async function sendSquadSms(args: { to: string; body: string }) {
  if (isLive) {
    if (!SMS_SENDER_ID) {
      return { ok: false, error: "sender_id_not_configured", source: "live-fallback" as const, note: "Set SQUAD_SMS_SENDER_ID in .env.local to a Sender ID approved on your Squad dashboard." };
    }
    const r = await callSquad<any>("POST", "/sms/send/instant", {
      sender_id: SMS_SENDER_ID,
      messages: [{ phone_number: toLocalMsisdn(args.to), message: args.body }],
    });
    if (r.ok) return { ok: true, source: "live" as const, raw: r.data };
    if (r.error?.toLowerCase().includes("sender")) {
      return { ok: false, error: r.error, source: "live-fallback" as const, note: "Register your Sender ID on the Squad dashboard before live SMS will deliver." };
    }
    return { ok: false, error: r.error, source: "live" as const };
  }
  return { ok: true, source: "mock" as const };
}

// ── Refund (dispute path) ──────────────────────────────────────────────
// Squad's sandbox requires all of: transaction_ref (your idempotency ref),
// gateway_transaction_ref (Squad-assigned ref from the original charge),
// refund_type ("full" | "partial"), refund_amount (kobo, partial only),
// and reason_for_refund (not "reason"). Source: empirical sandbox errors May 2026.
export async function refundTransaction(args: {
  transactionRef: string;
  gatewayTransactionRef: string;
  amountNaira?: number;
  reason?: string;
}) {
  if (isLive) {
    const isPartial = typeof args.amountNaira === "number" && args.amountNaira > 0;
    const body: any = {
      transaction_ref: args.transactionRef,
      gateway_transaction_ref: args.gatewayTransactionRef,
      refund_type: isPartial ? "partial" : "full",
      reason_for_refund: args.reason || "Dispute resolution",
    };
    if (isPartial) body.refund_amount = args.amountNaira! * 100;
    const r = await callSquad<any>("POST", "/transaction/refund", body);
    if (r.ok) return { ok: true, source: "live" as const, raw: r.data };
    return { ok: false, error: r.error, source: "live" as const };
  }
  return { ok: true, source: "mock" as const };
}

// ── Business Static VA — the path that ACTUALLY works on our merchant ───
// Squad's enablement reply confirmed "Profile for static Virtual Account".
// Endpoint: POST /virtual-account/business. Verified May 2026 to return a
// real NUBAN (e.g. 4576563989, bank_code 058 = GTBank).
// Use this for the per-merchant / per-customer permanent VA model. Customers
// pay into this NUBAN with the transaction_ref as NIP narration.
export async function createBusinessVA(args: {
  customerIdentifier: string;
  businessName: string;
  mobileNum: string;
  bvn: string;
  beneficiaryAccount?: string;
  email?: string;
}) {
  if (isLive) {
    const r = await callSquad<any>("POST", "/virtual-account/business", {
      customer_identifier: args.customerIdentifier,
      business_name: args.businessName,
      mobile_num: args.mobileNum,
      bvn: args.bvn,
      beneficiary_account: args.beneficiaryAccount || "0000000000",
      email: args.email,
    });
    if (r.ok && r.data?.data?.virtual_account_number) {
      return {
        ok: true as const,
        va: r.data.data.virtual_account_number as string,
        bankCode: r.data.data.bank_code as string,
        customerIdentifier: r.data.data.customer_identifier as string,
        source: "live" as const,
        raw: r.data,
      };
    }
    return { ok: false as const, error: r.error || "no_va_returned", source: "live" as const };
  }
  const seed = crypto.createHash("sha256").update(args.customerIdentifier).digest("hex");
  return {
    ok: true as const,
    va: `90${seed.replace(/[^0-9]/g, "").padEnd(8, "0").slice(0, 8)}`,
    bankCode: "058",
    customerIdentifier: args.customerIdentifier,
    source: "mock" as const,
  };
}

// ── Transactions query (operator reconciliation) ───────────────────────
// Correct path is /virtual-account/merchant/transactions (not /transactions —
// that returns 404). Returns transactions paid into any of this merchant's VAs.
export async function listTransactions(opts: { page?: number; perPage?: number } = {}) {
  if (isLive) {
    const qs = `?page=${opts.page || 1}&perPage=${opts.perPage || 50}`;
    const r = await callSquad<any>("GET", `/virtual-account/merchant/transactions${qs}`);
    if (r.ok) return { ok: true, items: r.data?.data || [], source: "live" as const };
    return { ok: false, error: r.error, source: "live" as const };
  }
  return { ok: true, items: [], source: "mock" as const };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  if (!SECRET) {
    // In mock mode, accept any signature so the simulator works for judges without keys
    return true;
  }
  const mac = crypto.createHmac("sha512", SECRET).update(rawBody).digest("hex");
  return mac.toLowerCase() === signature.toLowerCase();
}

export function signMockWebhook(rawBody: string) {
  // Sign with whatever secret is available, or a constant for fully-mock mode
  const key = SECRET || "jara_mock_secret";
  return crypto.createHmac("sha512", key).update(rawBody).digest("hex");
}

// Fee calculators per squadco.com/pricing
export function vaFee(amountNaira: number) {
  return Math.min(Math.round(amountNaira * 0.0025), 1000);
}
export function gatewayFee(amountNaira: number) {
  return Math.min(Math.round(amountNaira * 0.012), 1500);
}
export function transferFee(amountNaira: number) {
  if (amountNaira <= 5_000) return 8;
  if (amountNaira <= 50_000) return 20;
  return 40;
}
