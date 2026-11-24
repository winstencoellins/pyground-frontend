"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// What the program below really prints (checked with Python 3.11).
const OUTPUT = ["beras  Rp 14,000", "telur  Rp 28,000", "gula   Rp 17,500", "Total  Rp 59,500"];

// Each line is a list of [token type, text]; plain strings keep the indentation safe from formatting.
type Tok = ["k" | "s" | "n" | "c" | "f" | "t", string];
const CODE: Tok[][] = [
  [["c", "# Hitung total belanja di warung"]],
  [["t", "belanjaan = {"]],
  [
    ["t", "    "],
    ["s", '"beras"'],
    ["t", ": "],
    ["n", "14000"],
    ["t", ","],
  ],
  [
    ["t", "    "],
    ["s", '"telur"'],
    ["t", ": "],
    ["n", "28000"],
    ["t", ","],
  ],
  [
    ["t", "    "],
    ["s", '"gula"'],
    ["t", ": "],
    ["n", "17500"],
    ["t", ","],
  ],
  [["t", "}"]],
  [
    ["t", "total = "],
    ["n", "0"],
  ],
  [
    ["k", "for"],
    ["t", " barang, harga "],
    ["k", "in"],
    ["t", " belanjaan.items():"],
  ],
  [
    ["t", "    "],
    ["f", "print"],
    ["t", "("],
    ["s", 'f"{barang:<6} Rp{harga:>7,}"'],
    ["t", ")"],
  ],
  [["t", "    total += harga"]],
  [
    ["f", "print"],
    ["t", "("],
    ["s", 'f"Total  Rp{total:>7,}"'],
    ["t", ")"],
  ],
];
const tokClass: Record<Tok[0], string> = {
  k: "text-code-keyword font-semibold",
  s: "text-code-string",
  n: "text-code-number",
  c: "text-code-comment italic",
  f: "font-semibold",
  t: "",
};

/** Landing-page demo: replays the real output line by line. The real Pyodide playground is #14. */
export function PlaygroundDemo() {
  const [shown, setShown] = useState(OUTPUT.length); // complete at rest
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  const run = () => {
    clearInterval(timer.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(OUTPUT.length);
    setShown(0);
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= OUTPUT.length) clearInterval(timer.current);
        return n + 1;
      });
    }, 380);
  };

  return (
    <div
      aria-label="Contoh playground"
      className="min-w-0 overflow-hidden rounded-[18px] border bg-card shadow-[0_24px_48px_-28px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
    >
      <div className="flex items-center justify-between gap-2.5 border-b py-2.5 pr-3 pl-4">
        <span className="flex items-center gap-2 font-mono text-[0.8rem] text-muted-foreground">
          <span className="font-sans text-[0.82rem] font-bold text-foreground">Dictionary dan Set</span>· main.py
        </span>
        <Button size="lg" className="px-4 font-bold" onClick={run}>
          Jalankan
        </Button>
      </div>
      <pre className="overflow-x-auto px-[18px] py-4 font-mono text-[0.86rem] leading-[1.75]">
        {CODE.map((line, i) => (
          <div key={i}>
            <span className="inline-block w-[1.6em] text-code-comment opacity-70 select-none">{i + 1}</span>
            {line.map(([type, text], j) => (
              <span key={j} className={tokClass[type]}>
                {text}
              </span>
            ))}
          </div>
        ))}
      </pre>
      <div
        aria-live="polite"
        className="min-h-28 border-t border-dashed bg-muted px-[18px] pt-3 pb-3.5 font-mono text-[0.82rem]"
      >
        <span className="mb-1 block font-sans text-[0.72rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
          Output
        </span>
        <div className="whitespace-pre">
          {OUTPUT.slice(0, shown).join("\n")}
          {shown < OUTPUT.length && (
            <span className="inline-block h-[1em] w-[0.55em] animate-pulse bg-primary align-[-2px]" />
          )}
        </div>
      </div>
    </div>
  );
}
