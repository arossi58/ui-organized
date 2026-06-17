import { useState } from "react";
import { IconProvider } from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import { usePreviewProperties } from "./usePreviewProperties";
import { PreviewPortalContext } from "./previewPortal";
import { PreviewKitchenSink } from "./PreviewKitchenSink";
import { PreviewIcons } from "./PreviewIcons";
import { PreviewTypography } from "./PreviewTypography";
import { PreviewSizing } from "./PreviewSizing";
import { PreviewExamples } from "./PreviewExamples";
import { PreviewExport } from "./PreviewExport";
import styles from "./PreviewContainer.module.css";

export function PreviewContainer() {
  const { icons, activePanel } = useBuilderStore();
  const previewStyle = usePreviewProperties();
  // State-backed callback ref so portaled overlays re-render once the themed
  // element is mounted and can be used as their portal container.
  const [themedEl, setThemedEl] = useState<HTMLDivElement | null>(null);

  return (
    <div className={styles.container}>
      {activePanel === "export" ? (
        // The generated stylesheet is builder-chrome content (code), not themed
        // DS output — render it outside the themed surface.
        <PreviewExport />
      ) : (
        <div
          ref={setThemedEl}
          className={`${styles.content} ${activePanel === "examples" ? styles.contentFlush : ""}`}
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
              {activePanel === "color"      && <PreviewKitchenSink />}
              {activePanel === "typography" && <PreviewTypography />}
              {activePanel === "sizing"     && <PreviewSizing />}
              {activePanel === "icons"      && <PreviewIcons />}
              {activePanel === "examples"   && <PreviewExamples />}
            </IconProvider>
          </PreviewPortalContext.Provider>
        </div>
      )}
    </div>
  );
}
