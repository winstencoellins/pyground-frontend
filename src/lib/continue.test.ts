import { describe, expect, test } from "bun:test";
import { continueLesson } from "./continue";

const ordered = ["a", "b", "c", "d"].map((slug) => ({ slug }));
const done = (...slugs: string[]) => slugs.map((slug) => ({ slug }));

describe("continueLesson", () => {
  test("new learner starts at the first lesson", () => expect(continueLesson(ordered, [])?.slug).toBe("a"));
  test("next after the latest completion", () => expect(continueLesson(ordered, done("a", "b"))?.slug).toBe("c"));
  test("follows the latest completion, not the furthest", () =>
    expect(continueLesson(ordered, done("c", "a"))?.slug).toBe("b"));
  test("wraps to the first gap", () => expect(continueLesson(ordered, done("a", "c", "d"))?.slug).toBe("b"));
  test("ignores removed lessons", () => expect(continueLesson(ordered, done("a", "gone"))?.slug).toBe("b"));
  test("skips lessons already done", () => expect(continueLesson(ordered, done("c", "a", "b"))?.slug).toBe("d"));
  test("null when everything is done", () => expect(continueLesson(ordered, done("a", "b", "c", "d"))).toBeNull());
});
