import { HeroStage } from "../components/hero/HeroStage";
import { SiteNav } from "../components/chrome/SiteNav";
import { OverviewSection } from "../components/sections/OverviewSection";
import { RoadmapSection } from "../components/sections/RoadmapSection";
import { ContactSection } from "../components/sections/ContactSection";
import { SiteFooter } from "../components/chrome/SiteFooter";

/**
 * Homepage — composes sections, holds no logic of its own (SITE.md §4).
 * The site nav is a page-level fixed header (not nested in the hero) so its
 * stacking sits at the document root — above every section, including cards
 * that raise their own stacking context on hover (transform).
 */
export function HomePage() {
  return (
    <>
      <SiteNav />
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
