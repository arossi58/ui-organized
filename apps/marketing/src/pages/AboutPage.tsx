import { AboutHero } from "../components/about/AboutHero";
import { SiteFooter } from "../components/chrome/SiteFooter";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

/**
 * About — the project's story, told in first person and signed. This is the one
 * page where the site's collective "we" becomes an "I": where the system and its
 * tools came from, and why the craft itself needs to be accessible.
 *
 * A single section, so the page composes one component and owns no logic.
 */
export function AboutPage() {
  useDocumentMeta({
    title: "About — UI Organized",
    description:
      "We talk about accessibility in design, but rarely about the accessibility of the craft itself. Why UI Organized grew from a personal toolkit into something free and open.",
  });

  return (
    <>
      <main id="main">
        <AboutHero />
      </main>
      <SiteFooter />
    </>
  );
}
