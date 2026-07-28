import { AboutHero } from "../components/about/AboutHero";
import { OriginSection } from "../components/about/OriginSection";
import { WhySection } from "../components/about/WhySection";
import { FutureSection } from "../components/about/FutureSection";
import { SiteFooter } from "../components/chrome/SiteFooter";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

/**
 * About — the project's origin story, told in first person. This is the one
 * page where the site's collective "we" becomes an "I": the how (a capstone
 * that outgrew itself), the why (three reasons it exists), and where it's
 * going next.
 *
 * Composes sections and owns no logic of its own, same as HomePage.
 */
export function AboutPage() {
  useDocumentMeta({
    title: "About — UI Organized",
    description:
      "Why UI Organized exists: a capstone passion project built to remove every reason to say no to a design system, democratize design, and give back to open source as a designer.",
  });

  return (
    <>
      <main id="main">
        <AboutHero />
        <OriginSection />
        <WhySection />
        <FutureSection />
      </main>
      <SiteFooter />
    </>
  );
}
