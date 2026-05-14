// Live probe of every Squad endpoint the app uses, against the merchant's
// sandbox key in .env.local. Prints status + first 240 chars of response.
// Usage: node scripts/probe_squad.mjs
import fs from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const SECRET = env.SQUAD_SECRET_KEY;
const BASE = env.SQUAD_BASE_URL || "https://sandbox-api-d.squadco.com";
if (!SECRET) {
  console.error("No SQUAD_SECRET_KEY in .env.local");
  process.exit(1);
}

async function probe(label, method, path, body) {
  const url = `${BASE}${path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const ms = Date.now() - t0;
    let snippet = text.replace(/\s+/g, " ").slice(0, 260);
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {}
    const code = parsed?.code ?? parsed?.statusCode ?? "";
    const msg = parsed?.message || "";
    console.log(
      `\n[${label}] ${method} ${path}\n  HTTP ${res.status} · ${ms}ms · code=${code} · msg=${msg}\n  ${snippet}`,
    );
  } catch (e) {
    console.log(`\n[${label}] ${method} ${path}\n  fetch_failed: ${e.message}`);
  }
}

console.log(`Probing ${BASE} as ${SECRET.slice(0, 16)}...\n`);

// 1. VAS · SMS — per docs.squadco.com: /sms/send/instant
await probe("vas_sms_correct", "POST", "/sms/send/instant", {
  sender_id: "Squadco",
  messages: [{ phone_number: "08064834011", message: "Probe: ignore." }],
});

// 1b. What our code currently hits (almost certainly wrong)
await probe("vas_sms_current_code", "POST", "/vas/sms", {
  msisdn: "08064834011",
  message: "Probe: ignore.",
});

// 2. Dynamic Virtual Account
await probe(
  "create_dynamic_va",
  "POST",
  "/virtual-account/create-dynamic-virtual-account",
  {
    transaction_ref: "SQUADCO-probe-" + Date.now(),
    amount: 5000_00,
    currency_id: "NGN",
    customer_identifier: "Probe Customer",
    beneficiary_account: "0000000000",
    expiry_seconds: 3600,
  },
);

// 3. Account Name Lookup — needs 6-digit nip code
await probe("account_lookup_6digit", "POST", "/payout/account/lookup", {
  bank_code: "000013", // GTBank NIP code
  account_number: "0123456789",
});
// Also try the legacy 3-digit code so we can see exact error
await probe("account_lookup_3digit", "POST", "/payout/account/lookup", {
  bank_code: "058",
  account_number: "0123456789",
});

// 4. Payout / Transfer
await probe("transfer_payout", "POST", "/payout/transfer", {
  transaction_reference: "SQUADCO-probe-out-" + Date.now(),
  amount: 100_00,
  bank_code: "000013",
  account_number: "0123456789",
  account_name: "PROBE NAME",
  currency_id: "NGN",
  remark: "probe",
});

// 5. Wallet balance
await probe("wallet_balance_with_currency", "GET", "/merchant/balance?currency_id=NGN", null);
await probe("wallet_balance_no_currency", "GET", "/merchant/balance", null);

// 6. Transactions list
const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
await probe(
  "transactions",
  "GET",
  `/transactions?startDate=${weekAgo}&endDate=${today}`,
  null,
);

// 7. Refund
await probe("refund", "POST", "/transaction/refund", {
  transaction_ref: "SQUADCO-nonexistent",
  refund_amount: 100_00,
  reason: "probe",
});

console.log("\nDone.");
