import { Link, useLocation } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import "../components/gradient/dot-grid.css";
import "./simple-page.css";

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
 * Uses the shared minimal-route shell (simple-page.css) so it inherits the same
 * dot lattice and prose treatment as every other simple route.
 */
export function NotFoundPage() {
  const { pathname } = useLocation();

  useDocumentMeta({ title: "Page not found — UI Organized" });

  return (
    <div className="simple-page">
      <div className="simple-page__dots dot-grid" aria-hidden="true" />

      <main className="simple-page__stage" id="main">
        <article className="simple-page__prose">
          <p className="simple-page__eyebrow">404</p>
          <h1 className="simple-page__title">Page not found</h1>
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
