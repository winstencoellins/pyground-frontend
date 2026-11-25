import { describe, expect, it } from "bun:test";
import { grade } from "./grade";

describe("grade", () => {
  const test = { input: ["7"], output: "7 ganjil\nselesai" };
  it("passes on the same output, ignoring trailing spaces and blank lines", () => {
    expect(grade(test, { status: "ok", out: [["out", "7 ganjil  \nselesai\n\n"]] })).toEqual({ pass: true });
  });
  it("fails on different text, with what was printed", () => {
    expect(grade(test, { status: "ok", out: [["out", "7 Ganjil\nselesai\n"]] })).toEqual({
      pass: false,
      reason: "output",
      got: "7 Ganjil\nselesai",
    });
  });
  it("does not count stderr warnings as output", () => {
    expect(
      grade(test, {
        status: "ok",
        out: [
          ["out", "7 ganjil\n"],
          ["err", "warn"],
          ["out", "selesai\n"],
        ],
      }),
    ).toEqual({
      pass: true,
    });
  });
  it("reports errors and runs that never finished", () => {
    expect(grade(test, { status: "error", out: [["err", "NameError: x\n"]] })).toEqual({
      pass: false,
      reason: "error",
      got: "NameError: x",
    });
    expect(grade(test, { status: "input", out: [] })).toEqual({ pass: false, reason: "input" });
    expect(grade(test, { status: "timeout", out: [] })).toEqual({ pass: false, reason: "timeout" });
  });
});
