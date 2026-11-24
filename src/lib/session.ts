import "server-only";
import { cache } from "react";
import { serverApi } from "./api-server";

/** The signed-in user from GET /api/me (forwarding the visitor's cookies), or null. Deduped per request. */
export const getMe = cache(async () => {
  const { data, error } = await (await serverApi()).api.me.get();
  return error ? null : data;
});
