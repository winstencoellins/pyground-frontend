"use client";

import { useEffect, useState } from "react";
import { learnables } from "./data";

/** Hero card that cycles through real lesson topics, with the next few fading out below it. */
export function LearnTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % learnables.length), 2400);
    return () => clearInterval(id);
  }, []);
  const next = [1, 2, 3, 4].map((k) => learnables[(i + k) % learnables.length]!);

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-2.5 pr-4 shadow-[0_18px_40px_-24px_rgb(27_29_58/0.45)]">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary font-mono text-[0.8rem] font-semibold text-primary-foreground">
          py
        </span>
        <div className="min-w-0">
          <p className="text-[0.72rem] text-muted-foreground">Di Pyground kamu belajar</p>
          <p
            key={i}
            className="animate-in truncate text-[0.9rem] font-semibold duration-500 fade-in slide-in-from-bottom-1"
          >
            {learnables[i]}
          </p>
        </div>
      </div>
      <ul aria-hidden className="grid gap-1.5 pl-[3.6rem] text-[0.85rem]">
        {next.map((t, k) => (
          <li key={t} className="truncate transition-opacity duration-500" style={{ opacity: 0.8 - k * 0.2 }}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
