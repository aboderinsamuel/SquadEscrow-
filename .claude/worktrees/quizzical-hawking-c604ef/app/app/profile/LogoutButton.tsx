"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }
  return (
    <button onClick={logout} className="text-[13px] font-semibold text-ink/60 hover:text-coral-600">
      Log out
    </button>
  );
}
