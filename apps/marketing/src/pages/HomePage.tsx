import { HeroStage } from "../components/hero/HeroStage";
import { OverviewSection } from "../components/sections/OverviewSection";
import { RoadmapSection } from "../components/sections/RoadmapSection";
import { ContactSection } from "../components/sections/ContactSection";
import { SiteFooter } from "../components/chrome/SiteFooter";

/**
 * Homepage — composes sections, holds no logic of its own (SITE.md §4). The
 * site nav is rendered once by SiteChrome (App.tsx) above the route outlet, so
 * it persists across navigation; here we just compose the page below it.
 */
export function HomePage() {
  return (
    <>
      <main id="main">
        <HeroStage />
        <OverviewSection />
        <RoadmapSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
