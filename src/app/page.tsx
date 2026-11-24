import { SiteHeader } from "@/components/landing/site-header";
import { Curriculum, Facts, Faq, FinalCta, Hero, HowItWorks, Pricing, SiteFooter } from "@/components/landing/sections";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="flex-1">
        <Hero />
        <Facts />
        <HowItWorks />
        <Curriculum />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
