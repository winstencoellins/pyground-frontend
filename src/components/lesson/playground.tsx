"use client";

import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { bracketMatching, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { AlertTriangle, Loader2, Play, RotateCcw, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { runPython, stopPython, warmUp, type OutputChunk, type RunStatus } from "@/lib/python/runner";
import { cn } from "@/lib/utils";

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
}: {
  initialCode: string;
  expectError?: boolean;
  labels: PlaygroundLabels;
}) {
  const code = initialCode.trim();
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView>(null);
  const runRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>("idle");
  const [out, setOut] = useState<OutputChunk[]>([]);
  const [notice, setNotice] = useState<keyof PlaygroundLabels | null>(null);
  const [answer, setAnswer] = useState("");
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
    void execute([]);
  }
  useEffect(() => {
    runRef.current = run;
  });

  function reset() {
    if (phase === "loading" || phase === "running") stopPython();
    const v = view.current!;
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: code } });
    setOut([]);
    setNotice(null);
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
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[0.82rem] font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/50"
          >
            <RotateCcw className="size-3.5" aria-hidden /> {labels.reset}
          </button>
          {busy ? (
            <button
              type="button"
              onClick={stopPython}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[0.82rem] font-semibold outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
            >
              <Square className="size-3 fill-current" aria-hidden /> {labels.stop}
            </button>
          ) : (
            <button
              type="button"
              onClick={run}
              title={labels.hint}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[0.82rem] font-semibold text-primary-foreground outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
            >
              <Play className="size-3.5 fill-current" aria-hidden /> {labels.run}
            </button>
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
            {labels.output}
          </p>
          <div aria-live="polite" className="font-mono text-[0.85rem] leading-relaxed">
            {busy ? (
              <p className="my-0 flex items-center gap-2 font-sans text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {phase === "loading" ? labels.loading : labels.running}
              </p>
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
