import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseEnabled = !!(url && serviceKey);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!supabaseEnabled) throw new Error("Supabase env vars missing (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)");
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-application": "squadco-escrow" } },
    });
  }
  return client;
}
