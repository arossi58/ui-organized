import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Agentation } from "agentation";
import { HomePage } from "./pages/HomePage";
import { DocsPage } from "./pages/DocsPage";
import { ToolsPage } from "./pages/ToolsPage";
import { Grain } from "./components/gradient/Grain";
import { ThemeProvider } from "./theme/ThemeProvider";

// Vite injects the deploy base (e.g. "/<repo>/" on GitHub Pages) as BASE_URL.
// React Router uses the same value so links resolve under that prefix.
const basename = import.meta.env.BASE_URL;

export function App() {
  return (
    // ThemeProvider applies the chosen brand + light/dark to <html>; the nav's
    // theme menu drives it (the whole site re-themes off the DS tokens).
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        {/* Full-page grain, rendered once across every route (SITE.md §6) */}
        <Grain />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocsPage />} />
          {/* Tools gallery — the bare path shows the first tool; /tools/<id>
              selects a specific one (both render the same page). */}
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:toolId" element={<ToolsPage />} />
        </Routes>
        {/* Agentation — lets AI coding agents annotate the running UI. Dev-only:
            `import.meta.env.DEV` is statically false in production, so Rollup
            tree-shakes the component (and the dependency) out of the build. */}
        {import.meta.env.DEV && <Agentation />}
      </BrowserRouter>
    </ThemeProvider>
  );
}
