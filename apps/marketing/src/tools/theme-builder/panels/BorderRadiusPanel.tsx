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
    </div>
  );
}
