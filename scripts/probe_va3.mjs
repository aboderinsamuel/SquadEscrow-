import fs from "node:fs";
import path from "node:path";
const env = Object.fromEntries(fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const SECRET = env.SQUAD_SECRET_KEY;
const BASE = env.SQUAD_BASE_URL || "https://sandbox-api-d.squadco.com";

async function POST(label, path, body) {
  const r = await fetch(`${BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const t = await r.text();
  console.log(`\n[${label}] POST ${path} HTTP ${r.status}\n  sent: ${JSON.stringify(body)}\n  got: ${t.slice(0, 320)}`);
}
async function GET(label, path) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${SECRET}` } });
  const t = await r.text();
  console.log(`\n[${label}] GET ${path} HTTP ${r.status}\n  got: ${t.slice(0, 280)}`);
}

// VA — dynamic, try empty body and just beneficiary
await POST("va_dyn_empty", "/virtual-account/create-dynamic-virtual-account", {});
await POST("va_dyn_just_beneficiary", "/virtual-account/create-dynamic-virtual-account", { beneficiary_account: "0123456789" });
await POST("va_dyn_amount", "/virtual-account/create-dynamic-virtual-account", { amount: 500000, beneficiary_account: "0123456789" });

// VA — customer (the /virtual-account/customer path that returned 'mobile_num is required')
await POST("va_cust_min", "/virtual-account/customer", {
  customer_identifier: "probe-" + Date.now(),
  first_name: "Probe", last_name: "Customer",
  mobile_num: "08064834011",
  email: "probe@example.com",
  bvn: "12345678901",
});

// VA — alternative dynamic path
await POST("va_dyn_alt1", "/virtual-account", { beneficiary_account: "0123456789" });
await POST("va_business_alt", "/virtual-account/business", { bvn: "12345678901", business_name: "Probe Co", mobile_num: "08064834011", beneficiary_account: "0123456789" });

// Transaction listing — try alternate paths
const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
await GET("dispute_history", "/dispute/history");
await GET("merchant_transactions", `/merchant/transactions/all?startDate=${weekAgo}&endDate=${today}`);
await GET("vacc_transactions", `/virtual-account/merchant/transactions`);
await GET("transactions_paginated", `/virtual-account/merchant/transactions?perPage=10&page=1`);

// SMS — try with a guess at default sender id
await POST("sms_no_sender", "/sms/send/instant", { messages: [{ phone_number: "08064834011", message: "probe" }] });
await POST("sms_default_sender", "/sms/send/instant", { sender_id: "SQUADCO", messages: [{ phone_number: "08064834011", message: "probe" }] });
await POST("sms_squad", "/sms/send/instant", { sender_id: "Squad", messages: [{ phone_number: "08064834011", message: "probe" }] });
await POST("sms_n-alert", "/sms/send/instant", { sender_id: "N-Alert", messages: [{ phone_number: "08064834011", message: "probe" }] });

// Refund — corrected field name
await POST("refund_gateway", "/transaction/refund", {
  gateway_transaction_ref: "fake_ref_123",
  refund_amount: 100_00,
  reason: "probe",
});

console.log("\nDone.");
