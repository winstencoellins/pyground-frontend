/**
 * The lesson to continue with: the first unfinished lesson after the one completed most recently, wrapping
 * to the first unfinished lesson overall. The first lesson for a new learner; null once everything is done.
 */
export function continueLesson<L extends { slug: string }>(ordered: L[], completed: { slug: string }[]): L | null {
  const done = new Set(completed.map((c) => c.slug));
  const last = completed.at(-1); // the API sorts completions by completedAt, oldest first
  const from = last ? ordered.findIndex((l) => l.slug === last.slug) + 1 : 0;
  return ordered.slice(from).find((l) => !done.has(l.slug)) ?? ordered.find((l) => !done.has(l.slug)) ?? null;
}
