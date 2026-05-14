// After Squad's "Profile for static VA" enable, find which path/body works.
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

async function probe(label, p, body) {
  const r = await fetch(`${BASE}${p}`, { method: "POST", headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const t = await r.text();
  let pj = null; try { pj = JSON.parse(t); } catch {}
  console.log(`\n[${label}] POST ${p}`);
  console.log("  HTTP", r.status, "msg:", pj?.message || t.slice(0, 200));
  if (pj?.data && Object.keys(pj.data).length) console.log("  data:", JSON.stringify(pj.data));
  return pj;
}

// /virtual-account/customer — individual permanent VA (with corrected mm/dd/yyyy)
await probe("customer_complete", "/virtual-account/customer", {
  customer_identifier: `probe-cust-${Date.now()}`,
  first_name: "Probe",
  last_name: "Customer",
  mobile_num: "08064834011",
  email: "probe@example.com",
  bvn: "22222222222",
  dob: "01/01/1990",
  address: "1 Probe Street, Lagos",
  gender: "1",
});

// /virtual-account/business — business permanent VA
await probe("business_min", "/virtual-account/business", {
  customer_identifier: `probe-biz-${Date.now()}`,
  business_name: "Probe Co Ltd",
  mobile_num: "08064834011",
  bvn: "22222222222",
});

// /virtual-account/business — full
await probe("business_full", "/virtual-account/business", {
  customer_identifier: `probe-biz-${Date.now()}`,
  business_name: "Probe Co Ltd",
  mobile_num: "08064834011",
  bvn: "22222222222",
  beneficiary_account: "0000000000",
  email: "probe@example.com",
});

// /virtual-account (generic)
await probe("generic_va", "/virtual-account", {
  customer_identifier: `probe-${Date.now()}`,
  first_name: "Probe",
  last_name: "Customer",
  mobile_num: "08064834011",
  email: "probe@example.com",
  bvn: "22222222222",
  dob: "01/01/1990",
});

// GET /virtual-account (list ours)
{
  const r = await fetch(`${BASE}/virtual-account?merchant_id=${MID}`, { headers: { Authorization: `Bearer ${SECRET}` } });
  const t = await r.text();
  console.log(`\n[list_VAs] GET /virtual-account?merchant_id=${MID}\n  HTTP ${r.status} :: ${t.slice(0, 220)}`);
}

// GET /virtual-account/me/customer (maybe to look up)
{
  const r = await fetch(`${BASE}/virtual-account/customer/me`, { headers: { Authorization: `Bearer ${SECRET}` } });
  const t = await r.text();
  console.log(`\n[customer/me] GET\n  HTTP ${r.status} :: ${t.slice(0, 220)}`);
}
