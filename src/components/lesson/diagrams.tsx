"use client";

import { Check, ChevronLeft, ChevronRight, Globe, Loader2, Pause, Play, Server } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn, fill } from "@/lib/utils";
import type messages from "../../../messages/id.json";

/* Animated diagrams for <AnimatedDiagram name="…" />. Each one is a short sequence of steps on a shared player:
   it autoplays only while on screen and never when the visitor prefers reduced motion; prev/next step by hand. */

export type DiagramLabels = (typeof messages)["Diagrams"];
type Player = ReturnType<typeof usePlayer>;
type DiagramProps = { labels: DiagramLabels; caption?: string };

const STEP_MS = 1800;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const m = matchMedia(reducedQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

function usePlayer(total: number) {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  // "auto" follows the reduced-motion setting; the visitor's play/pause or stepping overrides it.
  const [mode, setMode] = useState<"auto" | "playing" | "paused">("auto");
  const [visible, setVisible] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => matchMedia(reducedQuery).matches,
    () => true,
  );
  const playing = visible && (mode === "playing" || (mode === "auto" && !reduced));

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    // Hold the last step a little longer before starting over.
    const id = setTimeout(() => setStep((s) => (s + 1) % total), step === total - 1 ? STEP_MS * 2 : STEP_MS);
    return () => clearTimeout(id);
  }, [playing, step, total]);

  return {
    ref,
    step,
    total,
    playing,
    toggle: () => setMode(playing ? "paused" : "playing"),
    go: (delta: number) => {
      setMode("paused");
      setStep((s) => Math.min(total - 1, Math.max(0, s + delta)));
    },
  };
}

function Frame({
  player,
  labels,
  say,
  caption,
  children,
}: {
  player: Player;
  labels: DiagramLabels;
  say: string;
  caption?: string;
  children: React.ReactNode;
}) {
  const { ref, step, total, playing, toggle, go } = player;
  const button =
    "grid size-9 shrink-0 place-items-center rounded-full outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/50 disabled:opacity-40";
  return (
    <figure ref={ref} className="my-6 overflow-hidden rounded-2xl border bg-card">
      <div className="p-4 sm:p-5">{children}</div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t bg-muted/40 py-2 pr-2 pl-4">
        {/* Announce steps only when the visitor steps by hand; autoplay would be constant chatter. */}
        <p
          aria-live={playing ? "off" : "polite"}
          className="my-0 w-full text-[0.9rem] leading-snug sm:w-auto sm:min-w-0 sm:flex-1"
        >
          {say}
        </p>
        <span className="ml-auto text-[0.75rem] text-muted-foreground tabular-nums sm:ml-0">
          {fill(labels.step, { n: step + 1, total })}
        </span>
        <button type="button" aria-label={labels.prev} onClick={() => go(-1)} disabled={step === 0} className={button}>
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label={playing ? labels.pause : labels.play} onClick={toggle} className={button}>
          {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        </button>
        <button
          type="button"
          aria-label={labels.next}
          onClick={() => go(1)}
          disabled={step === total - 1}
          className={button}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
      {caption && (
        <figcaption className="border-t px-4 py-2.5 text-[0.85rem] text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}

type LineState = "active" | "error" | "skipped" | undefined;

function Code({
  lines,
  state,
  note,
}: {
  lines: string[];
  state: (i: number) => LineState;
  note?: (i: number) => React.ReactNode;
}) {
  return (
    <pre className="m-0 overflow-x-auto rounded-xl bg-muted py-2 font-mono text-[0.82rem] leading-relaxed">
      {lines.map((line, i) => {
        const s = state(i);
        return (
          <div
            key={i}
            className={cn(
              "border-l-[3px] border-transparent px-3 whitespace-pre transition-colors duration-300 motion-reduce:transition-none",
              s === "active" && "border-primary bg-primary/10",
              s === "error" && "border-destructive bg-destructive/10",
              s === "skipped" && "line-through opacity-40",
            )}
          >
            {line}
            {note?.(i)}
          </div>
        );
      })}
    </pre>
  );
}

function Output({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div className="rounded-xl border px-3 py-2">
      <p className="my-0 text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
      <pre className="m-0 min-h-[1.6em] font-mono text-[0.82rem] leading-relaxed whitespace-pre-wrap">
        {lines.map((l, i) => (
          <div key={i} className="animate-in duration-300 fade-in slide-in-from-left-1 motion-reduce:animate-none">
            {l}
          </div>
        ))}
      </pre>
    </div>
  );
}

/** Recipe steps run one by one, top to bottom. */
function InstructionsFlow({ labels, caption }: DiagramProps) {
  const L = labels.instructions;
  const player = usePlayer(L.lines.length + 2);
  const { step } = player;
  const say = step === 0 ? L.start : step <= L.lines.length ? fill(L.running, { n: step }) : L.done;
  return (
    <Frame player={player} labels={labels} say={say} caption={caption}>
      <ol className="m-0 grid list-none gap-2 p-0">
        {L.lines.map((line, i) => {
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300 motion-reduce:transition-none",
                active && "translate-x-1 border-primary bg-primary/10",
                done && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[0.75rem]",
                  active && "border-primary bg-primary text-primary-foreground",
                  done && "border-success bg-success text-background",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0">{line}</span>
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

/** for n in range(1, 6): the variable takes each value in turn and print runs once per pass. */
function ForLoop({ labels, caption }: DiagramProps) {
  const L = labels.forLoop;
  const values = [1, 2, 3, 4, 5];
  const player = usePlayer(values.length + 2);
  const { step } = player;
  const current = step >= 1 && step <= values.length ? step : null;
  const printed = values.slice(0, Math.min(step, values.length)).map(String);
  const say = step === 0 ? L.start : current ? fill(L.pass, { n: current }) : L.done;
  return (
    <Frame player={player} labels={labels} say={say} caption={caption}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-3">
          <Code
            lines={L.code}
            state={(i) => ((step === 0 && i === 0) || (current && i === 1) ? "active" : undefined)}
          />
          <div className="flex items-center gap-2 font-mono text-[0.9rem]">
            <span className="text-muted-foreground">{L.name} =</span>
            <span
              key={current ?? "none"}
              className="grid h-9 min-w-9 animate-in place-items-center rounded-lg border-2 border-primary px-2 font-semibold text-primary-text duration-300 zoom-in-75 fade-in motion-reduce:animate-none"
            >
              {current ?? "?"}
            </span>
          </div>
        </div>
        <div className="grid content-start gap-3">
          <div>
            <p className="mt-0 mb-1.5 font-mono text-[0.75rem] text-muted-foreground">{L.values}</p>
            <div className="flex gap-1.5">
              {values.map((v) => (
                <span
                  key={v}
                  className={cn(
                    "grid size-9 place-items-center rounded-lg border font-mono text-[0.9rem] transition-all duration-300 motion-reduce:transition-none",
                    v === current && "-translate-y-1 border-primary bg-primary text-primary-foreground",
                    current !== null && v < current && "text-muted-foreground",
                    step > values.length && "text-muted-foreground",
                  )}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
          <Output label={labels.output} lines={printed} />
        </div>
      </div>
    </Frame>
  );
}

/** The failing line raises, the rest of try is skipped, and except runs instead. */
function TryExcept({ labels, caption }: DiagramProps) {
  const L = labels.tryExcept;
  const player = usePlayer(L.say.length);
  const { step } = player;
  const activeLine = [0, 1, 2, 4, 5, -1][step];
  return (
    <Frame player={player} labels={labels} say={L.say[step]} caption={caption}>
      <div className="grid gap-3">
        <div className="relative">
          <Code
            lines={L.code}
            state={(i) =>
              i === 2 && step >= 2
                ? "error"
                : i === 3 && step >= 3
                  ? "skipped"
                  : i === activeLine
                    ? "active"
                    : undefined
            }
            note={(i) =>
              i === 3 &&
              step >= 3 && (
                <span className="ml-3 inline-block rounded-full border bg-card px-2 font-sans text-[0.7rem] text-muted-foreground">
                  {L.skipped}
                </span>
              )
            }
          />
          {step >= 2 && (
            <span className="absolute top-2 right-2 animate-in rounded-full bg-destructive px-2 py-0.5 font-mono text-[0.7rem] font-semibold text-white duration-300 zoom-in-90 fade-in motion-reduce:animate-none">
              ValueError
            </span>
          )}
        </div>
        <Output label={labels.output} lines={step >= 4 ? [L.printed] : []} />
      </div>
    </Frame>
  );
}

/** A request travels from the browser to the server and a response comes back. */
function RequestResponse({ labels, caption }: DiagramProps) {
  const L = labels.requestResponse;
  const player = usePlayer(L.say.length);
  const { step } = player;
  const packet =
    "absolute top-1/2 rounded-full px-2 py-1 font-mono text-[0.68rem] font-semibold whitespace-nowrap transition-all duration-1000 ease-in-out motion-reduce:transition-none";
  return (
    <Frame player={player} labels={labels} say={L.say[step]} caption={caption}>
      <div className="flex items-stretch gap-2">
        <div className="w-[38%] shrink-0 overflow-hidden rounded-xl border">
          <div className="flex items-center gap-1.5 border-b bg-muted px-2 py-1.5">
            <Globe className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate font-mono text-[0.68rem]">{L.url}</span>
          </div>
          <div className="grid min-h-24 content-start gap-1.5 p-2.5">
            {step === 4 ? (
              <div className="grid animate-in gap-1.5 duration-500 fade-in motion-reduce:animate-none">
                <p className="my-0 text-[0.8rem] leading-tight font-semibold">{L.page}</p>
                <span className="h-1.5 w-full rounded bg-muted" />
                <span className="h-1.5 w-4/5 rounded bg-muted" />
                <span className="h-1.5 w-3/5 rounded bg-muted" />
              </div>
            ) : (
              step > 0 && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
            )}
          </div>
          <p className="my-0 border-t px-2 py-1 text-center text-[0.7rem] font-semibold">{L.browser}</p>
        </div>

        <div className="relative min-w-0 flex-1" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 border-t border-dashed" />
          <span
            className={cn(packet, "bg-primary text-primary-foreground", step === 1 ? "opacity-100" : "opacity-0")}
            style={{ left: step >= 1 ? "100%" : "0%", transform: `translate(${step >= 1 ? "-100%" : "0"}, -50%)` }}
          >
            {L.request} →
          </span>
          <span
            className={cn(packet, "bg-success text-background", step === 3 ? "opacity-100" : "opacity-0")}
            style={{ left: step >= 3 ? "0%" : "100%", transform: `translate(${step >= 3 ? "0" : "-100%"}, -50%)` }}
          >
            ← {L.response}
          </span>
        </div>

        <div className="grid w-[26%] shrink-0 grid-rows-[1fr_auto] overflow-hidden rounded-xl border">
          <div
            className={cn(
              "grid place-items-center gap-1 p-2 text-center transition-colors duration-300",
              step === 2 && "bg-primary/10",
            )}
          >
            <Server className={cn("size-6", step === 2 ? "text-primary-text" : "text-muted-foreground")} aria-hidden />
            {step === 2 && (
              <span className="animate-in text-[0.65rem] leading-tight duration-300 fade-in motion-reduce:animate-none">
                {L.working}
              </span>
            )}
          </div>
          <p className="my-0 border-t px-2 py-1 text-center text-[0.7rem] font-semibold">{L.server}</p>
        </div>
      </div>
    </Frame>
  );
}

const diagrams: Record<string, (p: DiagramProps) => React.ReactNode> = {
  "instructions-flow": InstructionsFlow,
  "for-loop": ForLoop,
  "try-except-flow": TryExcept,
  "request-response": RequestResponse,
};

export function AnimatedDiagram({ name, caption, labels }: { name: string; caption?: string; labels: DiagramLabels }) {
  const Diagram = diagrams[name];
  if (Diagram) return <Diagram labels={labels} caption={caption} />;
  // A name the web app doesn't know yet: show the caption so the lesson still reads.
  if (!caption) return null;
  return (
    <figure className="my-6 rounded-2xl border bg-muted px-4 py-6 text-center">
      <figcaption className="text-[0.9rem] text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
