import { usePreviewProperties } from "./usePreviewProperties";
import { PreviewKitchenSink } from "./PreviewKitchenSink";
import styles from "./PreviewContainer.module.css";

export function PreviewContainer() {
  // React applies CSS custom properties (--foo: bar) via element.style.setProperty
  // when the key starts with '--'. The intersection type ensures TypeScript accepts
  // the keys while React applies them correctly to the DOM.
  const previewStyle = usePreviewProperties();

  return (
    <div
      className={styles.wrapper}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={previewStyle as any}
    >
      <PreviewKitchenSink />
    </div>
  );
}
