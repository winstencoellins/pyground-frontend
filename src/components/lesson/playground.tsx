"use client";

import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { bracketMatching, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { AlertTriangle, Check, CircleCheck, Loader2, Play, RotateCcw, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { grade, type ExerciseTest, type Verdict } from "@/lib/python/grade";
import { runPython, stopPython, warmUp, type OutputChunk, type RunStatus } from "@/lib/python/runner";
import { cn, fill } from "@/lib/utils";

export type PlaygroundLabels = {
  run: string;
  stop: string;
  reset: string;
  output: string;
  editor: string;
  hint: string;
  loading: string;
  running: string;
  noOutput: string;
  inputLabel: string;
  inputSend: string;
  expectError: string;
  timeout: string;
  limit: string;
  stopped: string;
  crash: string;
  offline: string;
};

/** Labels for exercise checking; {n} {passed} {total} are filled with fill(). */
export type CheckLabels = {
  check: string;
  checking: string;
  allPassed: string;
  someFailed: string;
  test: string;
  input: string;
  noInput: string;
  expected: string;
  got: string;
  nothingPrinted: string;
  needsInput: string;
};

type Phase = "idle" | "loading" | "running" | "input" | "done";

const highlight = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword],
    color: "var(--code-keyword)",
    fontWeight: "600",
  },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--code-string)" },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--code-number)" },
  { tag: tags.comment, color: "var(--code-comment)", fontStyle: "italic" },
]);

const theme = EditorView.theme({
  "&": { backgroundColor: "transparent" },
  "&.cm-focused": { outline: "none" },
  ".cm-content": { fontFamily: "var(--font-jetbrains), monospace", padding: "12px 0", caretColor: "var(--foreground)" },
  ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "var(--muted-foreground)" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "color-mix(in oklab, var(--muted) 60%, transparent)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "color-mix(in oklab, var(--primary) 22%, transparent) !important",
  },
  ".cm-cursor": { borderLeftColor: "var(--foreground)" },
});

const endNotice: Partial<Record<RunStatus, keyof PlaygroundLabels>> = {
  timeout: "timeout",
  limit: "limit",
  stopped: "stopped",
  crash: "crash",
  offline: "offline",
};

export function Playground({
  initialCode,
  expectError,
  labels,
  tests,
  checkLabels,
  onChecked,
}: {
  initialCode: string;
  expectError?: boolean;
  labels: PlaygroundLabels;
  /** Exercise mode: adds "Check" which runs the code once per test. */
  tests?: ExerciseTest[];
  checkLabels?: CheckLabels;
  onChecked?: (passed: boolean) => void;
}) {
  const code = initialCode.trim();
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView>(null);
  const runRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>("idle");
  const [out, setOut] = useState<OutputChunk[]>([]);
  const [notice, setNotice] = useState<keyof PlaygroundLabels | null>(null);
  const [answer, setAnswer] = useState("");
  const [verdicts, setVerdicts] = useState<Verdict[] | null>(null);
  const [checking, setChecking] = useState(false); // the panel shows check results, not a run's output
  // The answers given to input() so far, and the random seed, for replaying the current run.
  const session = useRef({ inputs: [] as string[], seed: 0 });

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: code,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          history(),
          drawSelection(),
          indentUnit.of("    "),
          EditorState.tabSize.of(4),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          python(),
          syntaxHighlighting(highlight),
          theme,
          EditorView.contentAttributes.of({ "aria-label": labels.editor }),
          EditorView.domEventHandlers({ focus: () => warmUp() }),
          keymap.of([
            {
              key: "Mod-Enter",
              run: () => {
                runRef.current();
                return true;
              },
            },
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            indentWithTab,
          ]),
        ],
      }),
    });
    view.current = v;
    return () => v.destroy();
  }, [code, labels.editor]);

  async function execute(inputs: string[]) {
    session.current.inputs = inputs;
    setNotice(null);
    const result = await runPython(view.current!.state.doc.toString(), inputs, session.current.seed, setPhase);
    setOut(result.out);
    setNotice(endNotice[result.status] ?? null);
    setPhase(result.status === "input" ? "input" : "done");
  }

  function run() {
    if (phase === "loading" || phase === "running") return;
    session.current.seed = Math.floor(Math.random() * 2 ** 31);
    setOut([]);
    setVerdicts(null);
    setChecking(false);
    void execute([]);
  }
  useEffect(() => {
    runRef.current = run;
  });

  async function check() {
    if (!tests || phase === "loading" || phase === "running") return;
    const source = view.current!.state.doc.toString();
    setOut([]);
    setNotice(null);
    setVerdicts(null);
    setChecking(true);
    const results: Verdict[] = [];
    for (const test of tests) {
      const result = await runPython(source, test.input ?? [], 0, setPhase, false);
      // Stop or no Python: not the learner's fault, so no verdicts.
      if (result.status === "stopped" || result.status === "offline") {
        setNotice(result.status);
        setPhase("done");
        return;
      }
      results.push(grade(test, result));
    }
    setVerdicts(results);
    setPhase("done");
    onChecked?.(results.every((v) => v.pass));
  }

  function reset() {
    if (phase === "loading" || phase === "running") stopPython();
    const v = view.current!;
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: code } });
    setOut([]);
    setNotice(null);
    setVerdicts(null);
    setPhase("idle");
  }

  const busy = phase === "loading" || phase === "running";

  return (
    <div data-phase={phase} className="my-6 overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-3 pl-1 font-mono text-[0.78rem] text-muted-foreground">
          <span>main.py</span>
          {expectError && (
            <span className="font-sans text-[0.75rem] font-semibold text-highlight">
              <AlertTriangle className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
              {labels.expectError}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[0.82rem] font-semibold whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/50"
          >
            <RotateCcw className="size-3.5" aria-hidden /> <span className="max-sm:sr-only">{labels.reset}</span>
          </button>
          {busy ? (
            <button
              type="button"
              onClick={stopPython}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[0.82rem] font-semibold whitespace-nowrap outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
            >
              <Square className="size-3 fill-current" aria-hidden /> {labels.stop}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={run}
                title={labels.hint}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.82rem] font-semibold whitespace-nowrap outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
                  tests ? "border" : "bg-primary text-primary-foreground",
                )}
              >
                <Play className="size-3.5 fill-current" aria-hidden /> {labels.run}
              </button>
              {tests && checkLabels && (
                <button
                  type="button"
                  onClick={check}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[0.82rem] font-semibold whitespace-nowrap text-primary-foreground outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
                >
                  <Check className="size-3.5" strokeWidth={3} aria-hidden /> {checkLabels.check}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 16px on phones so iOS does not zoom in when the editor gets focus. */}
      <div ref={host} className="overflow-x-auto text-[16px] sm:text-[0.875rem]">
        {/* Shown until CodeMirror mounts (and without JavaScript). */}
        <pre className="m-0 px-4 py-3 font-mono leading-[1.4] [&:not(:only-child)]:hidden">{code}</pre>
      </div>

      {phase !== "idle" && (
        <div className="border-t bg-muted/40 px-4 py-3">
          <p className="mt-0 mb-1.5 text-[0.72rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {checking ? checkLabels?.check : labels.output}
          </p>
          <div aria-live="polite" className="font-mono text-[0.85rem] leading-relaxed">
            {busy ? (
              <p className="my-0 flex items-center gap-2 font-sans text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {phase === "loading" ? labels.loading : checking ? checkLabels?.checking : labels.running}
              </p>
            ) : verdicts && tests && checkLabels ? (
              <CheckResults tests={tests} verdicts={verdicts} labels={checkLabels} runnerLabels={labels} />
            ) : (
              <>
                {out.length > 0 ? (
                  <pre className="m-0 max-h-80 overflow-auto whitespace-pre-wrap">
                    {out.map(([kind, text], i) => (
                      <span key={i} className={cn(kind === "err" && "text-destructive")}>
                        {text}
                      </span>
                    ))}
                  </pre>
                ) : (
                  !notice &&
                  phase === "done" && <p className="my-0 font-sans text-muted-foreground">{labels.noOutput}</p>
                )}
                {notice && <p className="mt-2 mb-0 font-sans text-[0.88rem] text-destructive">{labels[notice]}</p>}
              </>
            )}
          </div>
          {phase === "input" && (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const value = answer;
                setAnswer("");
                void execute([...session.current.inputs, value]);
              }}
            >
              <input
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                aria-label={labels.inputLabel}
                placeholder={labels.inputLabel}
                className="h-10 min-w-0 flex-1 rounded-xl border bg-background px-3 font-mono text-[16px] outline-none focus-visible:ring-4 focus-visible:ring-ring/50 sm:text-[0.875rem]"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-xl bg-foreground px-4 text-[0.85rem] font-semibold text-background outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
              >
                {labels.inputSend}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function CheckResults({
  tests,
  verdicts,
  labels,
  runnerLabels,
}: {
  tests: ExerciseTest[];
  verdicts: Verdict[];
  labels: CheckLabels;
  runnerLabels: PlaygroundLabels;
}) {
  const passed = verdicts.filter((v) => v.pass).length;
  const firstFail = verdicts.findIndex((v) => !v.pass);
  const fail = verdicts[firstFail];
  const test = tests[firstFail];
  const block = "m-0 mt-1 max-h-48 overflow-auto rounded-lg border bg-background px-3 py-2 whitespace-pre-wrap";
  return (
    <div className="grid gap-3 font-sans">
      <p className={cn("my-0 flex items-center gap-2 font-semibold", fail ? "text-foreground" : "text-success")}>
        {!fail && <CircleCheck className="size-5" aria-hidden />}
        {fill(fail ? labels.someFailed : labels.allPassed, { passed, total: verdicts.length })}
      </p>
      <ol className="my-0 flex flex-wrap gap-1.5 pl-0" aria-label={labels.test}>
        {verdicts.map((v, i) => (
          <li
            key={i}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.78rem] font-semibold",
              v.pass ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {v.pass ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
            {fill(labels.test, { n: i + 1 })}
          </li>
        ))}
      </ol>
      {fail && !fail.pass && test && (
        <div className="grid gap-2 text-[0.88rem]">
          <p className="my-0 font-semibold">{fill(labels.test, { n: firstFail + 1 })}</p>
          <p className="my-0 text-muted-foreground">
            {labels.input}:{" "}
            {test.input?.length ? (
              <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">
                {test.input.join(" ⏎ ")}
              </code>
            ) : (
              labels.noInput
            )}
          </p>
          <div>
            <p className="my-0 text-muted-foreground">{labels.expected}</p>
            <pre className={block}>{test.output}</pre>
          </div>
          <div>
            <p className="my-0 text-muted-foreground">{labels.got}</p>
            {fail.reason === "output" || fail.reason === "error" ? (
              <pre className={cn(block, fail.reason === "error" && "text-destructive")}>
                {fail.got || labels.nothingPrinted}
              </pre>
            ) : (
              <p className="my-0 mt-1 text-destructive">
                {fail.reason === "input" ? labels.needsInput : runnerLabels[endNotice[fail.reason] ?? "crash"]}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
