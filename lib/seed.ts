import { mutateAndPersist, readDB, id, hashPII, ensureHydrated } from "./db";
import type { User, Job, Application } from "./types";
import { seedDiscovery } from "./discovery";

const SEEDED_FLAG = "__seeded";

const sampleWorkers: Partial<User>[] = [
  { name: "Tunde A. Adeleke", phone: "+2348011234567", area: "Mushin", skills: ["generator", "electrical"], jobs_completed: 87, on_time_rate: 0.94, avg_rating: 4.7, kyc_tier: 3, bio: "I sabi gen, AC, fridge. 5+ years for repair." },
  { name: "Aisha M. Ibrahim", phone: "+2348022345678", area: "Kano", skills: ["data_entry", "transcription", "social_media"], jobs_completed: 42, on_time_rate: 0.98, avg_rating: 4.9, kyc_tier: 3, bio: "Remote data labelling and VA work. UNIBEN final year." },
  { name: "Chioma E. Okafor", phone: "+2348033456789", area: "Surulere", skills: ["cleaning", "errand"], jobs_completed: 64, on_time_rate: 0.91, avg_rating: 4.6, kyc_tier: 2, bio: "Reliable cleaning and errand services. Same-day available." },
  { name: "Emeka P. Nwosu", phone: "+2348044567890", area: "Yaba", skills: ["plumbing", "tiling"], jobs_completed: 31, on_time_rate: 0.89, avg_rating: 4.5, kyc_tier: 2, bio: "Plumbing, tiling, POP. Yaba and surrounding areas." },
  { name: "Folake B. Adeyemi", phone: "+2348055678901", area: "Lekki", skills: ["hairstyling", "photography"], jobs_completed: 19, on_time_rate: 0.95, avg_rating: 4.8, kyc_tier: 2, bio: "Home hairstyling + event photography. Lekki / VI." },
  { name: "Musa H. Bello", phone: "+2348066789012", area: "Wuse, Abuja", skills: ["ac_hvac", "electrical"], jobs_completed: 53, on_time_rate: 0.92, avg_rating: 4.6, kyc_tier: 3, bio: "AC installation + repair. 8 years experience." },
];

const sampleCustomers: Partial<User>[] = [
  { name: "Mrs. Okonkwo", phone: "+2348077890123", area: "Ikoyi" },
  { name: "Suraj Imports", phone: "+2348088901234", area: "Computer Village" },
];

const sampleJobs: (Partial<Job> & { customer_phone: string })[] = [
  { customer_phone: "+2348077890123", title: "5kVA Tiger gen won't start", description: "Generator died this morning. Need someone before 6pm today. Lekki Phase 1.", category: "generator", amount: 15000, area: "Lekki", urgency: "today" },
  { customer_phone: "+2348077890123", title: "AC servicing — 2 units", description: "Two split units in master bedroom and parlour. Last serviced 8 months ago.", category: "ac_hvac", amount: 12000, area: "Ikoyi", urgency: "this_week" },
  { customer_phone: "+2348088901234", title: "Errand runner — Alaba market today", description: "Pick up 3 cartons phone accessories from Alaba and bring to shop. Transport included.", category: "errand", amount: 8000, area: "Computer Village", urgency: "today" },
  { customer_phone: "+2348088901234", title: "Data entry — 200 product SKUs", description: "Input product names, prices, specs from PDF to Google Sheet. Remote OK.", category: "data_entry", amount: 25000, area: "Remote", urgency: "this_week" },
  { customer_phone: "+2348077890123", title: "Kitchen sink leaking", description: "Slow drip under sink. Likely worn-out coupling. Need part replaced.", category: "plumbing", amount: 6500, area: "Ikoyi", urgency: "today" },
  { customer_phone: "+2348088901234", title: "Social-media graphics — 10 posts", description: "Instagram product posts for phone accessories. Templates available.", category: "graphic_design", amount: 35000, area: "Remote", urgency: "flexible" },
];

export async function seedIfEmpty() {
  const db = await ensureHydrated();
  if ((db as any)[SEEDED_FLAG]) { await seedDiscovery(); return; }
  if (db.users.length > 0) {
    (db as any)[SEEDED_FLAG] = true;
    await seedDiscovery();
    return;
  }
  await mutateAndPersist((db) => {
    const phoneToId = new Map<string, string>();
    for (const w of sampleWorkers) {
      const uid = id("u");
      phoneToId.set(w.phone!, uid);
      db.users.push({
        id: uid,
        phone: w.phone!,
        name: w.name!,
        role: "worker",
        nin_hash: hashPII("seed_" + w.phone),
        kyc_tier: (w.kyc_tier as any) || 3,
        liveness_passed: true,
        bank_code: "058",
        account_number: "0123456" + Math.floor(100 + Math.random() * 900),
        account_name: w.name!.toUpperCase(),
        area: w.area,
        bio: w.bio,
        skills: w.skills,
        jara_score: 0, // recalc later
        jobs_completed: w.jobs_completed || 0,
        avg_rating: w.avg_rating || 0,
        on_time_rate: w.on_time_rate || 0,
        disputes: 0,
        created_at: Date.now() - 90 * 86400000,
      });
    }
    for (const c of sampleCustomers) {
      const uid = id("u");
      phoneToId.set(c.phone!, uid);
      db.users.push({
        id: uid,
        phone: c.phone!,
        name: c.name!,
        role: "customer",
        kyc_tier: 2,
        area: c.area,
        jara_score: 720,
        jobs_completed: 0,
        avg_rating: 0,
        on_time_rate: 0,
        disputes: 0,
        created_at: Date.now() - 120 * 86400000,
      });
    }
    const createdJobs: { id: string; customer_id: string; category: string }[] = [];
    for (const j of sampleJobs) {
      const customer_id = phoneToId.get(j.customer_phone)!;
      const jid = id("j");
      db.jobs.push({
        id: jid,
        customer_id,
        title: j.title!,
        description: j.description!,
        category: j.category as any,
        amount: j.amount!,
        area: j.area!,
        urgency: j.urgency as any,
        state: "POSTED",
        created_at: Date.now() - Math.floor(Math.random() * 3 * 3600000),
      });
      createdJobs.push({ id: jid, customer_id, category: j.category as any });
    }

    // Pre-fund the first job and add applicants so the customer demo has immediate richness.
    const firstJob = db.jobs.find((j) => j.id === createdJobs[0].id);
    if (firstJob) {
      firstJob.state = "FUNDED";
      firstJob.funded_at = Date.now() - 8 * 60_000;
      firstJob.escrow_va = "9035120048";
      firstJob.escrow_ref = "SQUADCO-" + firstJob.id;
      db.transactions.push({
        id: id("tx"),
        job_id: firstJob.id,
        user_id: firstJob.customer_id,
        type: "escrow_in",
        channel: "va",
        squad_ref: firstJob.escrow_ref!,
        amount: firstJob.amount,
        fee: Math.min(Math.round(firstJob.amount * 0.0025), 1000),
        status: "success",
        created_at: firstJob.funded_at!,
      });
    }

    // Seed 2-3 applications per first two jobs so customer dashboard isn't empty.
    const workers = db.users.filter((u) => u.role === "worker");
    for (let i = 0; i < Math.min(2, createdJobs.length); i++) {
      const job = db.jobs.find((j) => j.id === createdJobs[i].id)!;
      const matching = workers
        .filter((w) => (w.skills || []).includes(createdJobs[i].category))
        .slice(0, 3);
      const pool = matching.length ? matching : workers.slice(0, 3);
      pool.forEach((w, idx) => {
        const offer = idx === 0 ? job.amount : Math.round(job.amount * (1 + (idx * 0.05 - 0.05)));
        db.applications.push({
          id: id("a"),
          job_id: job.id,
          worker_id: w.id,
          offer_amount: offer,
          message: idx === 0
            ? "I can come right away. I have all the tools and replacement parts on me."
            : idx === 1
              ? "Sir/Ma good day. I sabi this work well well. I can finish today."
              : "Available now. Will need 2 hours max.",
          status: "pending",
          created_at: Date.now() - (idx + 1) * 6 * 60_000,
        });
      });
    }

    (db as any)[SEEDED_FLAG] = true;
  });
  await seedDiscovery();
}
