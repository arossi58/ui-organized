import type { ReactNode } from "react";
import "../components/gradient/dot-grid.css";
import "./legal-page.css";

/**
 * Shared chrome for the site's legal pages (Privacy Policy, Terms of Service,
 * Cookie Policy). Mirrors the About route: the persistent nav stays in flow at
 * the top, then a centred reading column sits on the same flat cream surface +
 * dot lattice as the rest of the site.
 *
 * Pages pass their body as children; the `.legal-prose` container styles the
 * headings/paragraphs/lists/links it contains (see legal-page.css), so pages
 * write plain semantic markup without per-element class names.
 */
export function LegalPage({
  eyebrow = "Legal",
  title,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  /** Human-readable "last updated" date, e.g. "12 July 2026". */
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="legal-page">
      {/* Same flat-surface dot lattice the other routes sit on. */}
      <div className="legal-page__dots dot-grid" aria-hidden="true" />

      <main className="legal-page__stage" id="main">
        <article className="legal-prose">
          <p className="legal-prose__eyebrow">{eyebrow}</p>
          <h1 className="legal-prose__title">{title}</h1>
          <p className="legal-prose__updated">Last updated {updated}</p>
          {children}
        </article>
      </main>
    </div>
  );
}
