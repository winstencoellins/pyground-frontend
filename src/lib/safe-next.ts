/** Where to go after signing in. */
export const AFTER_AUTH_PATH = "/dashboard";

/**
 * Post-login destination from a `?next=` value: a locale-less, same-site path like "/lessons/variables"
 * (the locale router adds /id or /en). Anything else falls back to AFTER_AUTH_PATH, so there are no open redirects.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return AFTER_AUTH_PATH;
  return next;
}
