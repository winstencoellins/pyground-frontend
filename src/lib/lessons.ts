import "server-only";
import { cache } from "react";
import { serverApi } from "./api-server";

type Locale = "id" | "en";

/** Lesson index for the current visitor (locked flags depend on their pass). */
export async function getLessonIndex(locale: Locale) {
  const { data, error } = await (await serverApi()).api.lessons.get({ query: { locale } });
  if (error) throw new Error(`lesson index failed: ${error.status}`);
  return data;
}

export type LessonResult =
  | { ok: true; lesson: NonNullable<Awaited<ReturnType<typeof fetchLesson>>["data"]> }
  | { ok: false; reason: "locked" | "not-found" };

async function fetchLesson(slug: string, locale: Locale) {
  return (await serverApi()).api.lessons({ slug }).get({ query: { locale } });
}

/** One lesson's MDX source, or why it can't be shown. Other API failures throw (error page). Deduped per request. */
export const getLesson = cache(async (slug: string, locale: Locale): Promise<LessonResult> => {
  const { data, error } = await fetchLesson(slug, locale);
  if (!error) return { ok: true, lesson: data };
  // The API contract only declares 422; 401/403/404 come from its error handler.
  const status = error.status as number;
  if (status === 401 || status === 403) return { ok: false, reason: "locked" };
  if (status === 404 || status === 422) return { ok: false, reason: "not-found" };
  throw new Error(`lesson ${slug} failed: ${status}`);
});

/** The visitor's progress (completed slugs, per-stage counts), or null when signed out. Deduped per request. */
export const getProgress = cache(async () => {
  const { data, error } = await (await serverApi()).api.progress.get();
  return error ? null : data;
});
