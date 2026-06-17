import { Range } from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import styles from "./BorderRadiusPanel.module.css";

export function BorderRadiusPanel() {
  const { radiusBase, setRadiusBase } = useBuilderStore();

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Base Unit</h3>
        <p className={styles.hint}>
          All radius values are derived from this single unit. At 4px the scale
          matches the canonical system values exactly — see the live preview for
          the full scale.
        </p>

        <Range
          size="sm"
          value={radiusBase}
          min={1}
          max={16}
          step={1}
          formatValue={(v) => `${v}px`}
          onValueChange={setRadiusBase}
        />
      </section>
    </div>
  );
}
