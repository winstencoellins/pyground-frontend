"use client";

import { Play } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

export type Tok = ["k" | "s" | "n" | "c" | "f" | "t", string];

const tokClass: Record<Tok[0], string> = {
  k: "text-code-keyword font-semibold",
  s: "text-code-string",
  n: "text-code-number",
  c: "text-code-comment italic",
  f: "font-semibold",
  t: "",
};

/** Interactive part of the landing demo: replays the output line by line. The real Pyodide playground is #14. */
export function PlaygroundView({
  code,
  output,
  labels,
}: {
  code: Tok[][];
  output: string[];
  labels: { region: string; lesson: string; run: string; output: string };
}) {
  // Starts empty (a blinking cursor) and "runs" itself once the hero has come in; Run replays it.
  const [shown, setShown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const run = () => {
    clearInterval(timer.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(output.length);
    setShown(0);
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= output.length) clearInterval(timer.current);
        return n + 1;
      });
    }, 380);
  };

  const autoRun = useEffectEvent(() => run());
  useEffect(() => {
    const id = setTimeout(autoRun, 1100);
    return () => {
      clearTimeout(id);
      clearInterval(timer.current);
    };
  }, []);

  return (
    <div
      aria-label={labels.region}
      className="min-w-0 overflow-hidden rounded-[22px] border bg-card shadow-[0_40px_80px_-40px_rgb(10_31_28/0.5)]"
    >
      <div className="flex items-center justify-between gap-2.5 border-b py-2.5 pr-3 pl-4">
        <span className="flex min-w-0 items-center gap-2 font-mono text-[0.8rem] text-muted-foreground">
          <span className="truncate font-sans text-[0.82rem] font-bold text-foreground">{labels.lesson}</span>
          <span className="hidden whitespace-nowrap sm:inline">· main.py</span>
        </span>
        <button
          type="button"
          onClick={run}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 text-[0.82rem] font-semibold text-background outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
        >
          <Play className="size-3.5" aria-hidden /> {labels.run}
        </button>
      </div>
      <pre className="overflow-x-auto px-[18px] py-4 font-mono text-[0.8rem] leading-[1.75]">
        {code.map((line, i) => (
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
          {labels.output}
        </span>
        <div className="whitespace-pre">
          {output.slice(0, shown).join("\n")}
          {shown < output.length && (
            <span className="inline-block h-[1em] w-[0.55em] animate-pulse bg-primary align-[-2px]" />
          )}
        </div>
      </div>
    </div>
  );
}
