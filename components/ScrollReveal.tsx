"use client";
import { useEffect } from "react";

/**
 * ScrollReveal — single component dropped into the landing page that
 * sets up an IntersectionObserver to add `.in-view` to every `.reveal`
 * element as it enters the viewport.
 *
 * Use by:
 *   1. Adding `className="reveal"` to any section you want to animate in
 *   2. Mounting <ScrollReveal /> once anywhere on the page
 */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
