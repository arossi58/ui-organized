import { Divider } from "@ui-organized/react";
import { BorderRadiusPanel } from "./BorderRadiusPanel";
import { SpacingPanel } from "./SpacingPanel";
import styles from "./SizingPanel.module.css";

/**
 * Combined "Sizing" controls — radius and spacing share a tab. Each is a
 * self-contained, self-labelled sub-panel (its DS Range carries the heading);
 * this just stacks them with a divider so the single Sizing tab covers both.
 */
export function SizingPanel() {
  return (
    <div className={styles.panel}>
      <BorderRadiusPanel />
      <Divider spacing="none" />
      <SpacingPanel />
    </div>
  );
}
