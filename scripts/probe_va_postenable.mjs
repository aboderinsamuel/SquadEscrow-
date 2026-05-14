// After Squad's "enabled" reply, probe Dynamic VA with multiple body shapes
// to find what's actually accepted.
import fs from "node:fs";
import path from "node:path";
const env = Object.fromEntries(
  fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/).filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const SECRET = env.SQUAD_SECRET_KEY;
const BASE = env.SQUAD_BASE_URL;
const MID = env.SQUAD_MERCHANT_ID || "SQUADCO";

async function probe(label, path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  let p = null; try { p = JSON.parse(t); } catch {}
  console.log(`\n[${label}] HTTP ${r.http || r.status}`);
  console.log("  sent:", JSON.stringify(body));
  console.log("  msg :", p?.message || t.slice(0, 200));
  if (p?.data && Object.keys(p.data).length) console.log("  data:", JSON.stringify(p.data));
  return p;
}

const VA = "/virtual-account/create-dynamic-virtual-account";

console.log("== Dynamic VA probe — finding accepted body shape ==");

// camelCase variant
await probe("camelCase_full", VA, {
  transactionRef: `${MID}-${Date.now()}`,
  amount: 5000_00,
  currencyId: "NGN",
  customerIdentifier: "probe-c",
  beneficiaryAccount: "0000000000",
  expirySeconds: 3600,
});

// Just transactionRef + amount + beneficiary
await probe("camel_tx_amt_ben", VA, {
  transactionRef: `${MID}-${Date.now()}`,
  amount: 5000_00,
  beneficiaryAccount: "0000000000",
});

// snake but minimal — let Squad assign ref
await probe("snake_min_beneficiary_only", VA, {
  beneficiary_account: "0000000000",
});

// snake + amount
await probe("snake_amount_beneficiary", VA, {
  amount: 5000_00,
  beneficiary_account: "0000000000",
});

// Customer-identifier-only (the path some docs suggest)
await probe("snake_customer_only", VA, {
  customer_identifier: `probe-${Date.now()}`,
  beneficiary_account: "0000000000",
});

// Snake with first/last name (Squad mentions this as gated by entitlement)
await probe("snake_with_names", VA, {
  first_name: "Probe",
  last_name: "Customer",
  beneficiary_account: "0000000000",
});

// Empty body — does it now return real data after enable?
await probe("empty_body", VA, {});

console.log("\n== Refund — find right field name ==");

const REF = "/transaction/refund";
await probe("refund_reason_full", REF, {
  transaction_ref: "X",
  gateway_transaction_ref: "Y",
  refund_type: "full",
  reason_for_refund: "test",
});
await probe("refund_reason_partial", REF, {
  transaction_ref: "X",
  gateway_transaction_ref: "Y",
  refund_type: "partial",
  refund_amount: 100,
  reason_for_refund: "test",
});
