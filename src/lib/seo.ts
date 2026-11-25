import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Per-page SEO: canonical + hreflang for both languages, and Open Graph text. Each indexable page sets its own;
 * a layout-level canonical would be inherited by every child page and point them all at the home page.
 * `canonicalLocale` overrides the canonical (an English URL that shows the Indonesian fallback text).
 */
export function pageMeta({
  locale,
  path = "",
  title,
  description,
  canonicalLocale = locale,
}: {
  locale: string;
  path?: string;
  title?: string;
  description: string;
  canonicalLocale?: string;
}): Metadata {
  return {
    ...(title && { title }),
    description,
    alternates: {
      canonical: `/${canonicalLocale}${path}`,
      // "/" picks the visitor's language (cookie / Accept-Language), so it is the x-default for the home page.
      languages: { id: `/id${path}`, en: `/en${path}`, "x-default": path ? `/id${path}` : "/" },
    },
    openGraph: {
      type: "website",
      siteName: brand.name,
      locale: locale === "id" ? "id_ID" : "en_US",
      url: `/${locale}${path}`,
      ...(title && { title }),
      description,
      // A page's own openGraph replaces the inherited one, so point at the [locale] share card explicitly.
      images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: brand.name }],
    },
  };
}
