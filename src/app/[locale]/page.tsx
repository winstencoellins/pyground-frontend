import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SiteHeader } from "@/components/landing/site-header";
import {
  Faq,
  FinalCta,
  Hero,
  Overview,
  Pricing,
  Showcase,
  SiteFooter,
  Stages,
  TopicStrip,
  Why,
} from "@/components/landing/sections";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : "id",
    namespace: "Metadata",
  });
  // No `title`: the layout's default (the full tagline) is the home page title.
  return pageMeta({ locale, description: t("description") });
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="top" className="flex-1">
        <Hero />
        <TopicStrip />
        <Why />
        <Overview />
        <Stages />
        <Showcase />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <ScrollReveal />
    </>
  );
}
