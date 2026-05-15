// In-memory ring buffer of every outbound Squad API call.
// Survives within a single Vercel lambda instance (cold start resets).
// Surfaced on the operator console so judges can see real HTTP traffic to
// Squad's API as it happens during the demo.

export type SquadCall = {
  id: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  status?: number;
  ok: boolean;
  error?: string;
  duration_ms: number;
  at: number;
};

type LogGlobals = { __squadco_call_log?: SquadCall[] };
const g = globalThis as unknown as LogGlobals;
if (!g.__squadco_call_log) g.__squadco_call_log = [];

const MAX = 100;

export function recordSquadCall(c: Omit<SquadCall, "id" | "at">) {
  const buf = g.__squadco_call_log!;
  buf.unshift({
    ...c,
    id: Math.random().toString(36).slice(2, 10),
    at: Date.now(),
  });
  if (buf.length > MAX) buf.length = MAX;
}

export function getSquadCalls(): SquadCall[] {
  return (g.__squadco_call_log || []).slice();
}
