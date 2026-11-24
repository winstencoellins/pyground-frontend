import { treaty } from "@elysiajs/eden";
import type { App } from "@winstencoellins/pyground-api-types";

/**
 * Typed API client for client components. In the browser it calls this same origin, so requests go
 * through the /api rewrite and carry the session cookie. During server rendering it calls the API directly.
 */
export const api = treaty<App>(
  typeof window === "undefined" ? (process.env.API_URL ?? "http://localhost:3001") : window.location.origin,
  { fetch: { credentials: "include" } },
);
