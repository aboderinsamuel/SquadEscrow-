// Find the correct body shape for create-dynamic-virtual-account
import fs from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const SECRET = env.SQUAD_SECRET_KEY;
const BASE = env.SQUAD_BASE_URL || "https://sandbox-api-d.squadco.com";

async function try_(label, body) {
  const r = await fetch(`${BASE}/virtual-account/create-dynamic-virtual-account`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  console.log(`\n[${label}] HTTP ${r.status}\n  body sent: ${JSON.stringify(body)}\n  ${text.slice(0, 320)}`);
}

// Try the "initiate" route — SDK suggests this is the actual endpoint for an
// on-demand VA tied to an amount/email/ref
async function tryInit(label, body) {
  const r = await fetch(`${BASE}/virtual-account/initiate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  console.log(`\n[INIT ${label}] HTTP ${r.status}\n  body sent: ${JSON.stringify(body)}\n  ${text.slice(0, 320)}`);
}

// 1. SDK-style: amount, duration, email, transactionRef
await try_("snake_full", {
  amount: 5000_00, duration: 3600,
  email: "test@example.com",
  transactionRef: "SQUADCO-probe-" + Date.now(),
  currency_id: "NGN",
});

// 2. Permanent VA shape (customer)
await try_("permanent_shape", {
  customer_identifier: "probe-" + Date.now(),
  first_name: "Probe", last_name: "Customer",
  mobile_num: "08064834011", email: "test@example.com",
  bvn: "12345678901",
});

// 3. Minimal amount + duration only
await try_("minimal_amt_dur", { amount: 5000_00, duration: 3600 });

// 4. With name fields
await try_("with_names", {
  amount: 5000_00, duration: 3600,
  email: "test@example.com",
  first_name: "Probe", last_name: "Customer",
});

// 5. transactionRef camelCase only
await try_("just_camelref", {
  amount: 5000_00, duration: 3600,
  transactionRef: "SQUADCO-probe-" + Date.now(),
});

// 6. Initiate path — SDK indicates this exists
await tryInit("amount_email_ref", {
  amount: 5000_00, duration: 3600,
  email: "test@example.com",
  transactionRef: "SQUADCO-probe-" + Date.now(),
});

console.log("\nDone.");
