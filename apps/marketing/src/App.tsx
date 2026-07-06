import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Agentation } from "agentation";
import { HomePage } from "./pages/HomePage";
import { DocsPage } from "./pages/DocsPage";
import { ToolsPage } from "./pages/ToolsPage";
import { AboutPage } from "./pages/AboutPage";
import { SiteNav } from "./components/chrome/SiteNav";
import { Grain } from "./components/gradient/Grain";
import { ThemeProvider } from "./theme/ThemeProvider";
import { initAnalytics } from "./lib/analytics";
import { usePageTracking } from "./hooks/usePageTracking";

// Load gtag.js and configure GA4 once, before first render. No-op unless
// VITE_GA_MEASUREMENT_ID is set, so dev/preview stay silent. See lib/analytics.
initAnalytics();

// Vite injects the deploy base (e.g. "/<repo>/" on GitHub Pages) as BASE_URL.
// React Router uses the same value so links resolve under that prefix.
const basename = import.meta.env.BASE_URL;

/**
 * Persistent app chrome: one SiteNav instance lives above the route outlet and
 * survives navigation, so its selected pill can morph continuously from the old
 * tab to the new one (rather than the nav remounting per page). The variant is
 * derived from the path — home floats the nav over its hero (overlay), content
 * pages keep it in flow (solid). Must live inside <BrowserRouter> for useLocation.
 */
function SiteChrome() {
  const { pathname } = useLocation();
  const variant = pathname === "/" ? "overlay" : "solid";

  // Emit a GA4 page view on each route change (no-op when analytics is off).
  usePageTracking();

  return (
    <div className="site-chrome">
      <SiteNav variant={variant} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs" element={<DocsPage />} />
        {/* Tools gallery — the bare path shows the first tool; /tools/<id>
            selects a specific one (both render the same page). */}
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/:toolId" element={<ToolsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    // ThemeProvider applies the chosen brand + light/dark to <html>; the nav's
    // theme menu drives it (the whole site re-themes off the DS tokens).
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        {/* Full-page grain, rendered once across every route (SITE.md §6) */}
        <Grain />
        <SiteChrome />
        {/* Agentation — lets AI coding agents annotate the running UI. Dev-only:
            `import.meta.env.DEV` is statically false in production, so Rollup
            tree-shakes the component (and the dependency) out of the build. */}
        {import.meta.env.DEV && <Agentation />}
      </BrowserRouter>
    </ThemeProvider>
  );
}
