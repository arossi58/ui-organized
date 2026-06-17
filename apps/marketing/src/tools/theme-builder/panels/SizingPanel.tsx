import { BorderRadiusPanel } from "./BorderRadiusPanel";
import { SpacingPanel } from "./SpacingPanel";
import styles from "./SizingPanel.module.css";

/**
 * Combined "Sizing" controls — radius and spacing share a tab. Each is a
 * self-contained sub-panel (base unit + derived scale); this just stacks them
 * under labelled groups with a divider so the single Sizing tab covers both.
 */
export function SizingPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.group}>
        <h2 className={styles.groupTitle}>Radius</h2>
        <BorderRadiusPanel />
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <h2 className={styles.groupTitle}>Spacing</h2>
        <SpacingPanel />
      </div>
    </div>
  );
}
