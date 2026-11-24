import "server-only";
import { treaty } from "@elysiajs/eden";
import type { App } from "@winstencoellins/pyground-api-types";
import { headers } from "next/headers";

/**
 * Typed API client for server components and route handlers. Calls the API directly and forwards the
 * visitor's cookies, so the API sees the same session as the browser. Reading headers makes the page dynamic.
 */
export async function serverApi() {
  const cookie = (await headers()).get("cookie") ?? "";
  return treaty<App>(process.env.API_URL ?? "http://localhost:3001", { headers: cookie ? { cookie } : {} });
}
