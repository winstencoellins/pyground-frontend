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

export default function Home() {
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
