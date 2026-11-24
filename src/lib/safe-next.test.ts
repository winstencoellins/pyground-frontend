import { describe, expect, it } from "bun:test";
import { AFTER_AUTH_PATH, safeNext } from "./safe-next";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/lessons/variables")).toBe("/lessons/variables");
    expect(safeNext("/billing?plan=pass")).toBe("/billing?plan=pass");
  });
  it("rejects anything that could leave the site", () => {
    for (const bad of [
      null,
      undefined,
      "",
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "evil",
      "javascript:alert(1)",
    ]) {
      expect(safeNext(bad)).toBe(AFTER_AUTH_PATH);
    }
  });
});
