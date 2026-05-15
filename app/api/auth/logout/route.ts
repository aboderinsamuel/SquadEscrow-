import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST() {
<<<<<<< HEAD
  logout();
=======
  // MUST await: logout() clears the session cookie via cookies().set/delete,
  // which only attaches a Set-Cookie header to the response if it runs
  // *before* the response is constructed. Without await, NextResponse.json
  // ships first and the cookie deletion happens too late — the browser keeps
  // the cookie and the user appears logged in on the very next request.
  await logout();
>>>>>>> 3b3298f981096c33ac3e495edea8c3de294f4293
  return NextResponse.json({ ok: true });
}
