import { Link, useLocation } from "react-router-dom";
import "../components/gradient/dot-grid.css";
import "./about-page.css";

/**
 * The site-level catch-all.
 *
 * Needed because the asset host now serves the app shell for any unmatched path
 * (`not_found_handling: "single-page-application"`), which is what makes a deep
 * link like `/tools` return 200 instead of 404. The tradeoff is that a genuinely
 * wrong URL also reaches the app — so without this route it would render the
 * site chrome around an empty page, which reads as a broken site rather than a
 * wrong address.
 *
 * Reuses the About page's layout so it inherits the same dot lattice and prose
 * treatment as every other simple route.
 */
export function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="about-page">
      <div className="about-page__dots dot-grid" aria-hidden="true" />

      <main className="about-page__stage" id="main">
        <article className="about-page__prose">
          <p className="about-page__eyebrow">404</p>
          <h1 className="about-page__title">Page not found</h1>
          <p>
            There's nothing at <code>{pathname}</code>.
          </p>
          <p>
            Try the <Link to="/">home page</Link>, the{" "}
            <Link to="/docs">documentation</Link>, or the{" "}
            <Link to="/tools">tools</Link>.
          </p>
        </article>
      </main>
    </div>
  );
}
