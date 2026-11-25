import { describe, expect, it } from "bun:test";
import { isProtected } from "./routes";

describe("isProtected", () => {
  it("matches protected sections and their sub-pages", () => {
    expect(isProtected("/dashboard")).toBe(true);
    expect(isProtected("/billing/result")).toBe(true);
    expect(isProtected("/payment/result")).toBe(true);
    expect(isProtected("/admin/users")).toBe(true);
  });
  it("leaves public pages alone, including look-alike paths", () => {
    for (const p of ["", "/", "/sign-in", "/lessons/variables", "/dashboards", "/billingx"]) {
      expect(isProtected(p)).toBe(false);
    }
  });
});
