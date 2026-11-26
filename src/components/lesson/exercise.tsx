"use client";

import { Compass, Crosshair, Lightbulb, ListChecks, Lock, MessageCircleQuestion, Mountain } from "lucide-react";
import { useState } from "react";
import type { ExerciseTest } from "@/lib/python/grade";
import { cn, fill } from "@/lib/utils";
import { Playground, type CheckLabels, type PlaygroundLabels } from "./playground";

/** Steps, hints and the reflection are plain strings; `backticks` in them become inline code. */
function Text({ children }: { children: string }) {
  return children.split("`").map((part, i) =>
    i % 2 ? (
      <code key={i} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.88em]">
        {part}
      </code>
    ) : (
      part
    ),
  );
}

export type ExerciseLabels = {
  guided: string;
  challenge: string;
  apply: string;
  steps: string;
  plan: string;
  examples: string;
  example: string;
  input: string;
  noInput: string;
  output: string;
  hidden: string;
  hint: string;
  nextHint: string;
  hintN: string;
  solution: string;
  solutionLocked: string;
  solutionLockedApply: string;
  solutionNote: string;
  reflect: string;
  check: CheckLabels;
};

/**
 * A hands-on problem checked against test cases in the browser.
 * guided: steps + starter code, every test shown. challenge: the problem only, one example shown and the
 * rest hidden, so the learner has to think about other cases. The model answer unlocks after one check.
 * apply: like challenge with an empty editor and no hints, and the model answer only unlocks once every test passes.
 */
export function Exercise({
  type,
  title,
  steps,
  starter = "",
  tests,
  examples = type === "guided" ? tests.length : 1,
  hints = [],
  solution,
  reflect,
  children,
  labels,
  runnerLabels,
}: {
  type: "guided" | "challenge" | "apply";
  title: string;
  steps?: string[];
  starter?: string;
  tests: ExerciseTest[];
  examples?: number;
  hints?: string[];
  solution: string;
  reflect?: string;
  children?: React.ReactNode;
  labels: ExerciseLabels;
  runnerLabels: PlaygroundLabels;
}) {
  const [hintsShown, setHintsShown] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const guided = type === "guided";
  const apply = type === "apply";
  const label = labels[type];
  const Icon = guided ? Compass : apply ? Crosshair : Mountain;
  const unlocked = apply ? passed : attempted;
  const locked = apply ? labels.solutionLockedApply : labels.solutionLocked;
  const shown = tests.slice(0, examples);
  const hidden = tests.length - shown.length;

  return (
    <section
      data-exercise={type}
      aria-label={`${label}: ${title}`}
      className="my-8 rounded-[22px] border bg-muted/40 p-5 sm:p-6"
    >
      <p
        className={cn(
          "mt-0 mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold",
          guided ? "bg-primary/10 text-primary-text" : "bg-highlight/10 text-highlight-text",
        )}
      >
        <Icon className="size-3.5" aria-hidden /> {label}
      </p>
      <h3 className="mt-0 mb-2 text-[1.2rem] font-semibold tracking-tight">{title}</h3>
      <div className="[&>p:first-child]:mt-0">{children}</div>

      {steps?.length ? (
        <>
          <p className="mt-4 mb-1 flex items-center gap-1.5 text-[0.9rem] font-semibold">
            <ListChecks className="size-4" aria-hidden /> {labels.steps}
          </p>
          <ol className="my-0 list-decimal space-y-1 pl-6 leading-[1.7]">
            {steps.map((s) => (
              <li key={s}>
                <Text>{s}</Text>
              </li>
            ))}
          </ol>
        </>
      ) : (
        !guided && <p className="my-3 text-[0.92rem] text-muted-foreground italic">{labels.plan}</p>
      )}

      <p className="mt-4 mb-2 text-[0.9rem] font-semibold">{labels.examples}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {shown.map((t, i) => (
          <div key={i} className="rounded-xl border bg-card px-3 py-2 text-[0.85rem]">
            <p className="my-0 text-[0.75rem] font-semibold text-muted-foreground">
              {fill(labels.example, { n: i + 1 })}
            </p>
            <p className="my-1 text-muted-foreground">
              {labels.input}:{" "}
              {t.input?.length ? (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">{t.input.join(" ⏎ ")}</code>
              ) : (
                labels.noInput
              )}
            </p>
            <p className="my-0 text-muted-foreground">{labels.output}:</p>
            <pre className="m-0 mt-1 overflow-x-auto font-mono text-[0.82rem] whitespace-pre">{t.output}</pre>
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <p className="mt-2 mb-0 text-[0.85rem] text-muted-foreground">{fill(labels.hidden, { count: hidden })}</p>
      )}

      <Playground
        initialCode={starter || " "}
        labels={runnerLabels}
        tests={tests}
        checkLabels={labels.check}
        onChecked={(ok) => {
          setAttempted(true);
          if (ok) setPassed(true);
        }}
      />

      {passed && reflect && (
        <div className="mb-4 rounded-xl border-l-4 border-success bg-card px-4 py-3">
          <p className="my-0 flex items-center gap-1.5 font-semibold">
            <MessageCircleQuestion className="size-4 text-success" aria-hidden /> {labels.reflect}
          </p>
          <p className="mt-1 mb-0 leading-relaxed">
            <Text>{reflect}</Text>
          </p>
        </div>
      )}

      {hintsShown > 0 && (
        <ol className="mt-0 mb-3 grid gap-2 pl-0">
          {hints.slice(0, hintsShown).map((h, i) => (
            <li key={h} className="flex gap-2 rounded-xl bg-card px-3 py-2 text-[0.92rem]">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-highlight-text" aria-hidden />
              <span>
                <b className="font-semibold">{fill(labels.hintN, { n: i + 1 })}:</b> <Text>{h}</Text>
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!apply && hintsShown < hints.length && (
          <button
            type="button"
            onClick={() => setHintsShown((n) => n + 1)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-4 text-[0.82rem] font-semibold outline-none hover:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/50"
          >
            <Lightbulb className="size-3.5" aria-hidden />
            {fill(hintsShown ? labels.nextHint : labels.hint, { n: hintsShown + 1, total: hints.length })}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowSolution((v) => !v)}
          disabled={!unlocked}
          aria-expanded={showSolution}
          title={unlocked ? undefined : locked}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-4 text-[0.82rem] font-semibold outline-none hover:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border"
        >
          {!unlocked && <Lock className="size-3.5" aria-hidden />}
          {labels.solution}
        </button>
        {!unlocked && <span className="text-[0.8rem] text-muted-foreground">{locked}</span>}
      </div>
      {showSolution && unlocked && (
        <div className="mt-3">
          <pre className="m-0 overflow-x-auto rounded-xl border bg-card px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
            {solution.trim()}
          </pre>
          <p className="mt-2 mb-0 text-[0.85rem] text-muted-foreground">{labels.solutionNote}</p>
        </div>
      )}
    </section>
  );
}
