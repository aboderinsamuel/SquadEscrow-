"use client";
import { useState } from "react";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the request fails, navigate home — better UX than appearing stuck.
    }
    // Hard navigation (not router.push) so the browser drops in-memory React
    // state, the new request goes out without the just-cleared cookie, and
    // every server component re-renders fresh. router.push reuses the cached
    // RSC tree and the page can still appear logged-in.
    window.location.href = "/";
  }
  return (
    <button onClick={logout} disabled={busy} className="text-[13px] font-semibold text-ink/60 hover:text-coral-600 disabled:opacity-60">
      {busy ? "Logging out…" : "Log out"}
    </button>
  );
}
