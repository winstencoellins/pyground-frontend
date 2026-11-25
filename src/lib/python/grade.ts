import type { RunResult } from "./runner";

/** One exercise test: the answers typed into input(), in order, and the exact printed output. */
export type ExerciseTest = { input?: string[]; output: string };

export type Verdict =
  | { pass: true }
  | { pass: false; reason: "output"; got: string }
  | { pass: false; reason: "error"; got: string }
  | { pass: false; reason: Exclude<RunResult["status"], "ok" | "error"> };

/** Trailing spaces on a line and blank lines at the end don't count; everything else must match. */
export const normalize = (text: string) =>
  text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd();

export function grade(test: ExerciseTest, result: RunResult): Verdict {
  const printed = (kind: "out" | "err") =>
    result.out
      .filter(([k]) => k === kind)
      .map(([, text]) => text)
      .join("");
  if (result.status === "error") return { pass: false, reason: "error", got: printed("err").trimEnd() };
  if (result.status !== "ok") return { pass: false, reason: result.status };
  const got = normalize(printed("out"));
  return got === normalize(test.output) ? { pass: true } : { pass: false, reason: "output", got };
}
