"use client";

import { useEffect } from "react";

/** Marks each .motion-reveal element .is-visible the first time it scrolls into view (CSS in globals.css). */
export function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll(".motion-reveal").forEach((el) => io.observe(el));
    document.documentElement.classList.add("motion-ready");
    return () => io.disconnect();
  }, []);
  return null;
}
