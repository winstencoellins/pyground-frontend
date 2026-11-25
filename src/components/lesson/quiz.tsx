"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { cn, fill } from "@/lib/utils";

/** `code` turns a question into "predict the output": the snippet is shown above the options. */
export type QuizQuestion = { question: string; code?: string; options: string[]; answer: number; explanation?: string };

export type QuizLabels = {
  progress: string; // "{answered} of {total} answered"
  correct: string;
  wrong: string;
  score: string; // "{correct} of {total} correct"
  perfect: string;
  retry: string;
  saved: string;
  saveFailed: string;
  signInToSave: string;
};

export function Quiz({ questions, slug, labels }: { questions: QuizQuestion[]; slug: string; labels: QuizLabels }) {
  const { data: session } = useSession();
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [round, setRound] = useState(0);
  const [save, setSave] = useState<"idle" | "saved" | "failed">("idle");

  const answered = answers.filter((a) => a !== null).length;
  const correct = answers.filter((a, i) => a === questions[i].answer).length;
  const done = answered === questions.length;

  function choose(qi: number, oi: number) {
    if (answers[qi] !== null) return;
    const next = answers.map((a, i) => (i === qi ? oi : a));
    setAnswers(next);
    if (next.every((a) => a !== null) && session) {
      const score = Math.round((next.filter((a, i) => a === questions[i].answer).length / questions.length) * 100);
      api.api
        .quiz({ slug })
        .attempts.post({ score, answers: next })
        .then(({ error }) => setSave(error ? "failed" : "saved"))
        .catch(() => setSave("failed"));
    }
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setSave("idle");
    setRound((r) => r + 1);
  }

  return (
    // Lessons put a "## Kuis" heading right above, so no title here.
    <div className="my-6 rounded-[22px] border bg-card p-5 sm:p-6">
      <p className="mt-0 mb-4 text-[0.85rem] text-muted-foreground">
        {fill(labels.progress, { answered, total: questions.length })}
      </p>

      <ol className="m-0 grid list-none gap-6 p-0">
        {questions.map((q, qi) => {
          const picked = answers[qi];
          return (
            <li key={`${round}-${qi}`} data-quiz-question>
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-3 p-0 font-semibold">
                  {qi + 1}. {q.question}
                </legend>
                {q.code && (
                  <pre className="mt-0 mb-3 overflow-x-auto rounded-xl border bg-muted px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
                    {q.code.trim()}
                  </pre>
                )}
                <div className="grid gap-2">
                  {q.options.map((o, oi) => {
                    const isAnswer = oi === q.answer;
                    const state = picked === null ? "open" : isAnswer ? "right" : picked === oi ? "wrong" : "rest";
                    return (
                      // Buttons, not radios: arrow keys on a radio group would lock in an answer while browsing.
                      // aria-disabled instead of disabled so keyboard focus stays put after answering.
                      <button
                        key={oi}
                        type="button"
                        aria-pressed={picked === oi}
                        aria-disabled={picked !== null}
                        onClick={() => choose(qi, oi)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[0.95rem] transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
                          state === "open" && "hover:border-foreground/40",
                          state === "right" && "border-success bg-success/10",
                          state === "wrong" && "border-destructive bg-destructive/10",
                          state === "rest" && "opacity-60",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                            state === "right" && "border-success bg-success text-background",
                            state === "wrong" && "border-destructive bg-destructive text-background",
                          )}
                        >
                          {state === "right" && <Check className="size-3.5" strokeWidth={3} />}
                          {state === "wrong" && <X className="size-3.5" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0">{o}</span>
                      </button>
                    );
                  })}
                </div>
                <div aria-live="polite">
                  {picked !== null && (
                    <p className="mt-3 mb-0 text-[0.92rem] leading-relaxed">
                      <strong className={picked === q.answer ? "text-success" : "text-destructive"}>
                        {picked === q.answer ? labels.correct : labels.wrong}
                      </strong>{" "}
                      {q.explanation}
                    </p>
                  )}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>

      {done && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <div aria-live="polite">
            <p className="my-0 text-[1.05rem] font-semibold">
              {fill(labels.score, { correct, total: questions.length })}
              {correct === questions.length && ` ${labels.perfect}`}
            </p>
            <p className="mt-1 mb-0 text-[0.85rem] text-muted-foreground">
              {!session ? (
                <Link
                  href={`/sign-in?next=${encodeURIComponent(`/lessons/${slug}`)}`}
                  className="font-semibold text-primary-text underline underline-offset-4"
                >
                  {labels.signInToSave}
                </Link>
              ) : save === "saved" ? (
                labels.saved
              ) : save === "failed" ? (
                labels.saveFailed
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.88rem] font-semibold outline-none hover:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/50"
          >
            <RotateCcw className="size-4" aria-hidden /> {labels.retry}
          </button>
        </div>
      )}
    </div>
  );
}
