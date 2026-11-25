import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { siteUrl } from "@/lib/seo";

type Index = { stages: { modules: { lessons: { slug: string; isFree: boolean }[] }[] }[] };

/** Free lesson slugs from the API (signed out, like a crawler). Paid lessons are noindex, so they're left out. */
async function freeLessonSlugs() {
  "use cache";
  cacheLife("hours");
  const res = await fetch(`${process.env.API_URL ?? "http://localhost:3001"}/api/lessons?locale=id`);
  if (!res.ok) throw new Error(`lesson index unavailable (${res.status})`); // not cached; next request retries
  const index = (await res.json()) as Index;
  return index.stages.flatMap((s) => s.modules.flatMap((m) => m.lessons.filter((l) => l.isFree).map((l) => l.slug)));
}

/** Each page once per language, with hreflang alternates. */
const entry = (path: string): MetadataRoute.Sitemap[number] => ({
  url: `${siteUrl}/id${path}`,
  alternates: { languages: { id: `${siteUrl}/id${path}`, en: `${siteUrl}/en${path}` } },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Per request (cached for hours): the API isn't reachable while the web app builds.
  await connection();
  const slugs = await freeLessonSlugs().catch((e) => {
    console.error(e);
    return [] as string[];
  });
  const paths = ["", "/lessons", ...slugs.map((s) => `/lessons/${s}`)];
  return paths.flatMap((path) => {
    const e = entry(path);
    return [e, { ...e, url: `${siteUrl}/en${path}` }];
  });
}
