import { useBuilderStore, type ActivePanel } from "./state/themeState";
import { ColorPanel } from "./panels/ColorPanel";
import { TypographyPanel } from "./panels/TypographyPanel";
import { BorderRadiusPanel } from "./panels/BorderRadiusPanel";
import { SpacingPanel } from "./panels/SpacingPanel";
import { IconsPanel } from "./panels/IconsPanel";
import { ExportPanel } from "./panels/ExportPanel";
import { PreviewContainer } from "./preview/PreviewContainer";
import styles from "./App.module.css";

const TABS: { id: ActivePanel; label: string }[] = [
  { id: "color",      label: "Color" },
  { id: "typography", label: "Typography" },
  { id: "radius",     label: "Radius" },
  { id: "spacing",    label: "Spacing" },
  { id: "icons",      label: "Icons" },
  { id: "export",     label: "Export" },
];

function PanelContent({ active }: { active: ActivePanel }) {
  switch (active) {
    case "color":      return <ColorPanel />;
    case "typography": return <TypographyPanel />;
    case "radius":     return <BorderRadiusPanel />;
    case "spacing":    return <SpacingPanel />;
    case "icons":      return <IconsPanel />;
    case "export":     return <ExportPanel />;
  }
}

export function App() {
  const { activePanel, setActivePanel } = useBuilderStore();

  return (
    <div className={styles.layout}>
      {/* ── Controls zone ─────────────────────────────────────────────────── */}
      <aside className={styles.controls}>
        {/* Header */}
        <div className={styles.controlsHeader}>
          <span className={styles.logo}>DS Theme Builder</span>
        </div>

        {/* Tab nav */}
        <nav className={styles.tabNav}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activePanel === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActivePanel(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Panel content */}
        <div className={styles.panelContent}>
          <PanelContent active={activePanel} />
        </div>
      </aside>

      {/* ── Preview zone ──────────────────────────────────────────────────── */}
      <main className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.previewLabel}>Live Preview</span>
        </div>
        <div className={styles.previewBody}>
          <PreviewContainer />
        </div>
      </main>
    </div>
  );
}
