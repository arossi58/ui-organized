import { useBuilderStore } from "../state/themeState";
import { SPACING_MULTIPLIERS } from "@ui-organized/utils";
import styles from "./SpacingPanel.module.css";

const SPACING_STEPS = Object.keys(SPACING_MULTIPLIERS) as (keyof typeof SPACING_MULTIPLIERS)[];

export function SpacingPanel() {
  const { spacingBaseUnit, spacingScale, setSpacingBase } = useBuilderStore();

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Base Unit</h3>
        <p className={styles.hint}>
          All spacing values are derived from this single unit. At 4px the scale
          matches the canonical system values exactly.
        </p>

        <div className={styles.baseRow}>
          <input
            type="number"
            className={styles.baseInput}
            value={spacingBaseUnit}
            min={1}
            max={16}
            step={1}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value));
              setSpacingBase(v);
            }}
          />
          <span className={styles.unit}>px</span>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Scale</h3>

        <div className={styles.scaleTable}>
          <div className={styles.tableHeader}>
            <span>Token</span>
            <span>Multiplier</span>
            <span>Value</span>
            <span>Visual</span>
          </div>

          {SPACING_STEPS.map((step) => {
            const multiplier = SPACING_MULTIPLIERS[step];
            const px = spacingScale[step] ?? multiplier * spacingBaseUnit;
            const barWidth = Math.min(px, 128);

            return (
              <div key={step} className={styles.tableRow}>
                <span className={styles.tokenName}>{step}</span>
                <span className={styles.multiplier}>×{multiplier}</span>
                <span className={styles.value}>{px}px</span>
                <div
                  className={styles.bar}
                  style={{ width: `${barWidth}px` }}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
