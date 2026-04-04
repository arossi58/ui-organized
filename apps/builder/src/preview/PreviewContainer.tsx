import { IconProvider } from "@ds/react";
import { useBuilderStore } from "../state/themeState";
import { usePreviewProperties } from "./usePreviewProperties";
import { PreviewKitchenSink } from "./PreviewKitchenSink";
import styles from "./PreviewContainer.module.css";

export function PreviewContainer() {
  const { icons } = useBuilderStore();
  const previewStyle = usePreviewProperties();

  return (
    <div
      className={styles.wrapper}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={previewStyle as any}
    >
      <IconProvider
        library={icons.library}
        style={icons.style}
        strokeAdjustment={icons.strokeAdjustment}
        baseSize={icons.baseSize}
        baseStroke={icons.baseStroke}
      >
        <PreviewKitchenSink />
      </IconProvider>
    </div>
  );
}
