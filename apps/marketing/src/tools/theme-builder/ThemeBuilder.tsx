import { Tabs } from "@ui-organized/react";
import { useBuilderStore, type ActivePanel } from "./state/themeState";
import { ColorPanel } from "./panels/ColorPanel";
import { TypographyPanel } from "./panels/TypographyPanel";
import { SizingPanel } from "./panels/SizingPanel";
import { IconsPanel } from "./panels/IconsPanel";
import { ExamplesPanel } from "./panels/ExamplesPanel";
import { ExportPanel } from "./panels/ExportPanel";
import { PreviewContainer } from "./preview/PreviewContainer";
import "./builder.css";
import styles from "./ThemeBuilder.module.css";

const TABS: { id: ActivePanel; label: string }[] = [
  { id: "color",      label: "Color" },
  { id: "typography", label: "Typography" },
  { id: "sizing",     label: "Sizing" },
  { id: "icons",      label: "Icons" },
  // { id: "examples", label: "Examples" }, // hidden for now — re-enable to show the Examples tab
  { id: "export",     label: "Export" },
];

// DS Tabs is array-driven (list + panels). We use it for the section tab bar and
// hide its empty panels via builder.css — the body below is our own two-pane
// layout, driven by the same `activePanel` state.
const TAB_ITEMS = TABS.map((t) => ({ value: t.id, label: t.label, content: null }));

function PanelContent({ active }: { active: ActivePanel }) {
  switch (active) {
    case "color":      return <ColorPanel />;
    case "typography": return <TypographyPanel />;
    case "sizing":     return <SizingPanel />;
    case "icons":      return <IconsPanel />;
    case "examples":   return <ExamplesPanel />;
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

export default function ThemeBuilder() {
  const { activePanel, setActivePanel } = useBuilderStore();

  return (
    <div className={`${styles.layout} theme-builder-tool`}>
      {/* ── Top bar: one DS tab set across the top · preview mode ──────────── */}
      <header className={styles.topBar}>
        <Tabs
          className={`${styles.tabs} tb-section-tabs`}
          tabs={TAB_ITEMS}
          value={activePanel}
          onValueChange={(v) => setActivePanel(v as ActivePanel)}
        />

        <PreviewModeSwitch />
      </header>

      {/* ── Body: controls (left) + contextual live preview (right) ───────── */}
      <div className={styles.body}>
        <aside className={styles.controls}>
          <div className={styles.panelContent}>
            <PanelContent active={activePanel} />
          </div>
        </aside>

        <main className={styles.preview}>
          <PreviewContainer />
        </main>
      </div>
    </div>
  );
}
