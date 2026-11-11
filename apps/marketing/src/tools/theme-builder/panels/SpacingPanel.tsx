import { Range } from "@ui-organized/react";
import { MIN_SPACING_BASE, useBuilderStore } from "../state/themeState";
import styles from "./SpacingPanel.module.css";

export function SpacingPanel() {
  const { spacingBaseUnit, setSpacingBase } = useBuilderStore();

  return (
    <div className={styles.panel}>
      <Range
        label="Spacing"
        size="sm"
        value={spacingBaseUnit}
        min={MIN_SPACING_BASE}
        max={16}
        step={1}
        formatValue={(v) => `${v}px`}
        onValueChange={setSpacingBase}
      />
    </div>
  );
}
