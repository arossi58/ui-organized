import { usePreviewProperties } from "./usePreviewProperties";
import { PreviewKitchenSink } from "./PreviewKitchenSink";
import styles from "./PreviewContainer.module.css";

export function PreviewContainer() {
  const previewStyle = usePreviewProperties();

  return (
    <div className={styles.wrapper} style={previewStyle}>
      <PreviewKitchenSink />
    </div>
  );
}
