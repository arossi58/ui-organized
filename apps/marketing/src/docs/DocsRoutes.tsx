/**
 * The docs subtree.
 *
 * Kept as one module so React Router's `/docs/*` route can be a single
 * `React.lazy` boundary: this chunk pulls the 128 KB manifest, the latest-hashes
 * artifact and all 45 story modules (which between them import most of the
 * component library), and none of that belongs in the home page's bundle.
 */
import { useRef, type RefObject } from "react";
import { Route, Routes } from "react-router-dom";
import { DocsLayout } from "./components";
import { DocsIntroPage } from "./pages/DocsIntroPage";
import { GetStartedPage } from "./pages/GetStartedPage";
import { ThemingPage } from "./pages/ThemingPage";
import { FoundationsColorPage } from "./pages/FoundationsColorPage";
import { FoundationsTypographyPage } from "./pages/FoundationsTypographyPage";
import { ComponentDocsPage } from "./pages/ComponentDocsPage";
import { ComponentUsagePage } from "./pages/ComponentUsagePage";
import { ComponentInspectPage } from "./pages/ComponentInspectPage";
import { DocsNotFound } from "./pages/DocsNotFound";
import "../components/gradient/dot-grid.css";
import "./docs.css";

export default function DocsRoutes() {
  const overlayHost = useRef<HTMLDivElement>(null);

  return (
    <div className="docs-page">
      {/* Same flat-surface dot lattice the home hero sits on, behind the frame. */}
      <div className="docs-page__dots dot-grid" aria-hidden="true" />
      <div className="docs-page__stage">
        <div className="docs-page__frame">
          <DocsRouteTree overlayHost={overlayHost} />
        </div>
      </div>
      {/* Zero-height; it exists only to give the compact nav sheet somewhere to
          portal to. Inside `.docs-page`, whose `isolation: isolate` scopes the
          sheet's z-index below the site nav's — so the nav pill stays on top and
          the docs nav never takes the primary navigation's place. Outside the
          frame and the stage, because both clip, and a preview surface deeper in
          uses `contain: paint` (which does trap `position: fixed`). */}
      <div className="docs-page__overlays" ref={overlayHost} />
    </div>
  );
}

function DocsRouteTree({ overlayHost }: { overlayHost: RefObject<HTMLDivElement | null> }) {
  return (
    <DocsLayout overlayHost={overlayHost}>
      <Routes>
        <Route index element={<DocsIntroPage />} />
        <Route path="get-started" element={<GetStartedPage />} />
        <Route path="theming" element={<ThemingPage />} />
        <Route path="foundations/color" element={<FoundationsColorPage />} />
        <Route path="foundations/typography" element={<FoundationsTypographyPage />} />
        {/* Every component view is a real route so they're linkable and the
            browser's back button works — the thing the old iframe couldn't do. */}
        <Route path=":slug" element={<ComponentDocsPage />} />
        <Route path=":slug/usage" element={<ComponentUsagePage />} />
        <Route path=":slug/inspect" element={<ComponentInspectPage />} />
        <Route path="*" element={<DocsNotFound />} />
      </Routes>
    </DocsLayout>
  );
}
