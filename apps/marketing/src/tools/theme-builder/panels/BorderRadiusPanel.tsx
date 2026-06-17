import { Range } from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import styles from "./BorderRadiusPanel.module.css";

export function BorderRadiusPanel() {
  const { radiusBase, setRadiusBase } = useBuilderStore();

  return (
    <div className={styles.panel}>
      <Range
        label="Radius"
        size="sm"
        value={radiusBase}
        min={1}
        max={16}
        step={1}
        formatValue={(v) => `${v}px`}
        onValueChange={setRadiusBase}
      />
      <p className={styles.hint}>
        All radius values are derived from this single unit. At 4px the scale
        matches the canonical system values exactly — see the live preview for
        the full scale.
      </p>
    </div>
  );
}
