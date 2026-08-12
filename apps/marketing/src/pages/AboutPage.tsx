import { AboutHero } from "../components/about/AboutHero";
import { SiteFooter } from "../components/chrome/SiteFooter";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

/**
 * About — the project's story in two paragraphs, told in first person. This is
 * the one page where the site's collective "we" becomes an "I": where the
 * system and its tools came from, and why they're free.
 *
 * A single section, so the page composes one component and owns no logic.
 */
export function AboutPage() {
  useDocumentMeta({
    title: "About — UI Organized",
    description:
      "Why UI Organized exists: a capstone that outgrew itself, kept free and open because access to good design tools decides how good the end experience gets.",
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
