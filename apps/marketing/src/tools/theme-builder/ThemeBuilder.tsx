import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { SegmentedControl, Tabs } from "@ui-organized/react";
import { useBuilderStore, type ActivePanel } from "./state/themeState";
import { ColorPanel } from "./panels/ColorPanel";
import { TypographyPanel } from "./panels/TypographyPanel";
import { SizingPanel } from "./panels/SizingPanel";
import { IconsPanel } from "./panels/IconsPanel";
import { ExamplesPanel } from "./panels/ExamplesPanel";
import { ExportPanel } from "./panels/ExportPanel";
import { PreviewContainer } from "./preview/PreviewContainer";
import { VisionFilterDefs, VisionFilterMenu } from "../../docs/a11y/VisionFilters";
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

/** Light/Dark control that drives the live preview's render mode. */
function PreviewModeSwitch() {
  const { previewMode, setPreviewMode } = useBuilderStore();

  return (
    <SegmentedControl
      size="sm"
      aria-label="Preview color mode"
      items={[
        // Components, not registered names: the builder lets you switch icon
        // library, and this control should not change with it.
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
      ]}
      value={previewMode}
      onValueChange={(v) => setPreviewMode(v as "light" | "dark")}
    />
  );
}

export default function ThemeBuilder() {
  const { activePanel, setActivePanel } = useBuilderStore();
  const [vision, setVision] = useState<string | null>(null);

  // Controls (left) + contextual live preview (right). Only the active tab's
  // panel carries it, so the preview mounts once rather than once per tab.
  const body = (
    <div className={styles.body}>
      <aside className={styles.controls}>
        <div className={styles.panelContent}>
          <PanelContent active={activePanel} />
        </div>
      </aside>

      <main className={styles.preview}>
        <PreviewContainer vision={vision} />
      </main>
    </div>
  );

  return (
    <div className={`${styles.layout} theme-builder-tool`}>
      {/* The tab list runs along the top edge, its underline sitting on the
          bar's bottom rule; the preview mode switch floats in the same row. */}
      <Tabs
        className={styles.tabs}
        size="small"
        tabs={TABS.map((t) => ({
          value: t.id,
          label: t.label,
          content: t.id === activePanel ? body : null,
        }))}
        value={activePanel}
        onValueChange={(v) => setActivePanel(v as ActivePanel)}
      />

      <div className={styles.modeSwitchSlot}>
        {/* The export preview is code, not themed UI, so there is nothing to
            simulate there. */}
        {activePanel !== "export" && <VisionFilterMenu value={vision} onChange={setVision} />}
        <PreviewModeSwitch />
      </div>
      <VisionFilterDefs />
    </div>
  );
}
