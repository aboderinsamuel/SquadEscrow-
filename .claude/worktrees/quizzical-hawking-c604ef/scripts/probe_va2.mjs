import fs from "node:fs";
import path from "node:path";
const env = Object.fromEntries(fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const SECRET = env.SQUAD_SECRET_KEY;
const BASE = env.SQUAD_BASE_URL || "https://sandbox-api-d.squadco.com";

async function probe(label, path, body) {
  const r = await fetch(`${BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const t = await r.text();
  console.log(`\n[${label}] ${path} HTTP ${r.status}\n  sent: ${JSON.stringify(body)}\n  got: ${t.slice(0, 280)}`);
}

// Try customer VA — typical Squad permanent VA shape
await probe("customer_va_min", "/virtual-account/create-dynamic-virtual-account", {
  first_name: "Probe", last_name: "Customer",
});

await probe("customer_va_with_id", "/virtual-account/create-dynamic-virtual-account", {
  first_name: "Probe", last_name: "Customer",
  customer_identifier: "probe-001",
});

await probe("customer_va_full", "/virtual-account/create-dynamic-virtual-account", {
  first_name: "Probe", last_name: "Customer",
  customer_identifier: "probe-001",
  mobile_num: "08064834011",
  email: "probe@example.com",
  beneficiary_account: "0123456789",
});

// Maybe try "customer" version of the path
await probe("create_customer_va", "/virtual-account/customer", {
  first_name: "Probe", last_name: "Customer",
  customer_identifier: "probe-001",
});

// Try the "merchant" prefix
await probe("merchant_va", "/merchant/virtual-account/dynamic", {
  amount: 5000, transaction_ref: "ref-" + Date.now(),
});

// Try transactions list at alternate paths
const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
async function get(label, path) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${SECRET}` } });
  const t = await r.text();
  console.log(`\n[${label}] GET ${path} HTTP ${r.status}\n  got: ${t.slice(0, 280)}`);
}
await get("transactions_v2", `/transactions/v2?startDate=${weekAgo}&endDate=${today}`);
await get("transactions_all", `/transaction/all?startDate=${weekAgo}&endDate=${today}`);
await get("merchant_transactions", `/merchant/transactions?startDate=${weekAgo}&endDate=${today}`);

console.log("\nDone.");
