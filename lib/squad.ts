import crypto from "node:crypto";

const BASE = process.env.SQUAD_BASE_URL || "https://sandbox-api-d.squadco.com";
const SECRET = process.env.SQUAD_SECRET_KEY || "";
const MERCHANT_ID = process.env.SQUAD_MERCHANT_ID || "SQUADCO";
const MODE_ENV = (process.env.SQUAD_MODE || "auto").toLowerCase();

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
    const r = await callSquad<any>("GET", "/merchant/balance");
    if (r.ok && r.data?.data) return { ok: true, balance: Number(r.data.data.AvailableBalance || 0) / 100, source: "live" as const };
    return { ok: false, error: r.error, source: "live" as const };
  }
  return { ok: true, balance: 8_400_000, source: "mock" as const };
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
