import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
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
    </>
  );
}
