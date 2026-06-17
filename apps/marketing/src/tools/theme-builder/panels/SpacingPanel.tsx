import { Range } from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import styles from "./SpacingPanel.module.css";

export function SpacingPanel() {
  const { spacingBaseUnit, setSpacingBase } = useBuilderStore();

  return (
    <div className={styles.panel}>
      <Range
        label="Spacing"
        size="sm"
        value={spacingBaseUnit}
        min={1}
        max={16}
        step={1}
        formatValue={(v) => `${v}px`}
        onValueChange={setSpacingBase}
      />
      <p className={styles.hint}>
        All spacing values are derived from this single unit. At 4px the scale
        matches the canonical system values exactly — see the live preview for
        the full scale.
      </p>
    </div>
  );
}
