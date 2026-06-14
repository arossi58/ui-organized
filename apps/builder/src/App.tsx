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

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/** Segmented Light/Dark control that drives the live preview's render mode. */
function PreviewModeSwitch() {
  const { previewMode, setPreviewMode } = useBuilderStore();
  const modes: { id: "light" | "dark"; label: string; Icon: () => JSX.Element }[] = [
    { id: "light", label: "Light", Icon: SunIcon },
    { id: "dark",  label: "Dark",  Icon: MoonIcon },
  ];

  return (
    <div className={styles.modeSwitch} role="group" aria-label="Preview color mode">
      {modes.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`${styles.modeButton} ${previewMode === id ? styles.modeButtonActive : ""}`}
          aria-pressed={previewMode === id}
          onClick={() => setPreviewMode(id)}
        >
          <Icon />
          {label}
        </button>
      ))}
    </div>
  );
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
          <PreviewModeSwitch />
        </div>
        <div className={styles.previewBody}>
          <PreviewContainer />
        </div>
      </main>
    </div>
  );
}
