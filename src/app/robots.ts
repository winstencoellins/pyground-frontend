import type { MetadataRoute } from "next";
import { PROTECTED_PREFIXES } from "@/config/routes";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas redirect crawlers to sign-in anyway; keep them (and the API) out of the crawl.
      disallow: ["/api/", ...routing.locales.flatMap((l) => PROTECTED_PREFIXES.map((p) => `/${l}${p}`))],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
