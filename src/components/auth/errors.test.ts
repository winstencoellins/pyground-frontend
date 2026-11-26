import { describe, expect, it } from "bun:test";
import { authErrorKey } from "./errors";

describe("authErrorKey", () => {
  it("reads pyground-api's nested { error: { code } } shape", () => {
    expect(authErrorKey({ status: 401, error: { code: "INVALID_EMAIL_OR_PASSWORD" } })).toBe(
      "INVALID_EMAIL_OR_PASSWORD",
    );
  });
  it("reads a top-level code and normalises the already-exists variant", () => {
    expect(authErrorKey({ status: 422, code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" })).toBe("USER_ALREADY_EXISTS");
  });
  it("maps 429 to RATE_LIMITED, no status to NETWORK, unknown codes to UNKNOWN", () => {
    expect(authErrorKey({ status: 429, error: { code: "RATE_LIMITED" } })).toBe("RATE_LIMITED");
    expect(authErrorKey({})).toBe("NETWORK");
    expect(authErrorKey({ status: 500, error: { code: "WHATEVER" } })).toBe("UNKNOWN");
    expect(authErrorKey(null)).toBe("UNKNOWN");
    expect(authErrorKey({ status: 400, error: { code: "INVALID_PASSWORD" } })).toBe("INVALID_PASSWORD");
  });
});
