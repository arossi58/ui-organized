import { useReady } from "./yjs/store.js";
import { useEnsureSelectionDefaults, useSelection, type AppPage } from "./state/SelectionContext.js";
import { NavSidebar } from "./components/NavSidebar.js";
import { TopBar } from "./components/TopBar.js";
import { TokensPage } from "./pages/TokensPage.js";
import { ThemesPage } from "./pages/ThemesPage.js";
import { GeneratorsPage } from "./pages/GeneratorsPage.js";
import { ExportPage } from "./pages/ExportPage.js";
import { SyncPage } from "./pages/SyncPage.js";

function renderPage(page: AppPage) {
  switch (page) {
    case "tokens":
      return <TokensPage />;
    case "themes":
      return <ThemesPage />;
    case "generators":
      return <GeneratorsPage />;
    case "export":
      return <ExportPage />;
    case "sync":
      return <SyncPage />;
  }
}

export function App() {
  const ready = useReady();
  useEnsureSelectionDefaults();
  const selection = useSelection();

  if (!ready) {
    return <div className="tm-loading">Loading workspace…</div>;
  }

  return (
    <div className="tm-app">
      <NavSidebar />
      <div className="tm-main">
        <TopBar />
        <main className="tm-page">{renderPage(selection.page)}</main>
      </div>
    </div>
  );
}
