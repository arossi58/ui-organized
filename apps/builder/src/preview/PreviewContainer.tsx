import { useState } from "react";
import { IconProvider } from "@ds/react";
import { useBuilderStore } from "../state/themeState";
import { usePreviewProperties } from "./usePreviewProperties";
import { PreviewPortalContext } from "./previewPortal";
import { PreviewKitchenSink } from "./PreviewKitchenSink";
import { PreviewIcons } from "./PreviewIcons";
import { PreviewTypography } from "./PreviewTypography";
import styles from "./PreviewContainer.module.css";

type PreviewTab = "components" | "icons" | "typography";

const TABS: { id: PreviewTab; label: string }[] = [
  { id: "components", label: "Components" },
  { id: "icons",      label: "Icons" },
  { id: "typography", label: "Typography" },
];

export function PreviewContainer() {
  const { icons } = useBuilderStore();
  const previewStyle = usePreviewProperties();
  const [activeTab, setActiveTab] = useState<PreviewTab>("components");
  // State-backed callback ref so portaled overlays re-render once the themed
  // element is mounted and can be used as their portal container.
  const [themedEl, setThemedEl] = useState<HTMLDivElement | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        ref={setThemedEl}
        className={styles.content}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={previewStyle as any}
      >
        <PreviewPortalContext.Provider value={themedEl}>
          <IconProvider
            library={icons.library}
            style={icons.style}
            strokeAdjustment={icons.strokeAdjustment}
            baseSize={icons.baseSize}
            baseStroke={icons.baseStroke}
          >
            {activeTab === "components" && <PreviewKitchenSink />}
            {activeTab === "icons"      && <PreviewIcons />}
            {activeTab === "typography" && <PreviewTypography />}
          </IconProvider>
        </PreviewPortalContext.Provider>
      </div>
    </div>
  );
}
