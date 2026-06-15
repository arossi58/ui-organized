import { SiteNav } from "../components/chrome/SiteNav";
import { LINKS } from "../lib/links";
import { useTheme } from "../theme/ThemeProvider";
import "../components/gradient/dot-grid.css";
import "./docs-page.css";

/**
 * Docs — the white-labeled Storybook embedded inside the marketing chrome so it
 * reads as one site: the real SiteNav stays on top, then Storybook is
 * "windowed" in a framed iframe below it.
 *
 * Storybook is served from the same origin (`<base>storybook/` — the Vite dev
 * server in development, the Pages deployment in production), so it shares the
 * site's theme via localStorage. We key the iframe on the active brand + mode
 * so toggling the theme in the nav reloads the embed to match.
 */
export function DocsPage() {
  const { mode, brand } = useTheme();

  return (
    <div className="docs-page">
      {/* Same flat-surface dot lattice the home hero sits on, behind the embed. */}
      <div className="docs-page__dots dot-grid" aria-hidden="true" />
      <SiteNav variant="solid" />
      <main className="docs-page__stage" id="main">
        <iframe
          key={`${mode}:${brand}`}
          className="docs-page__frame"
          src={LINKS.storybook}
          title="UI Organized — component documentation"
        />
      </main>
    </div>
  );
}
