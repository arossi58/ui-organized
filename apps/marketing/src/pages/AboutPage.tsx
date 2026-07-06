import "../components/gradient/dot-grid.css";
import "./about-page.css";

/**
 * About — placeholder while the page is being built out. Keeps the marketing
 * chrome and the flat cream + dot lattice the rest of the site uses, but shows
 * a simple "Under construction" note for now.
 */
export function AboutPage() {
  return (
    <div className="about-page">
      {/* Same flat-surface dot lattice the home hero + other routes sit on. */}
      <div className="about-page__dots dot-grid" aria-hidden="true" />

      <main className="about-page__stage" id="main">
        <article className="about-page__prose">
          <p className="about-page__eyebrow">About</p>
          <h1 className="about-page__title">Under construction</h1>
        </article>
      </main>
    </div>
  );
}
