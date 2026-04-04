import { useBuilderStore, RADIUS_MULTIPLIERS } from "../state/themeState";
import styles from "./BorderRadiusPanel.module.css";

const RADIUS_STEPS = Object.keys(RADIUS_MULTIPLIERS) as (keyof typeof RADIUS_MULTIPLIERS)[];

export function BorderRadiusPanel() {
  const { radiusBase, borderRadius, setRadiusBase } = useBuilderStore();

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Base Unit</h3>
        <p className={styles.hint}>
          All radius values are derived from this single unit. At 4px the scale
          matches the canonical system values exactly.
        </p>

        <div className={styles.baseRow}>
          <input
            type="number"
            className={styles.baseInput}
            value={radiusBase}
            min={1}
            max={16}
            step={1}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value));
              setRadiusBase(v);
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
            <span>Shape</span>
          </div>

          {RADIUS_STEPS.map((key) => {
            const multiplier = RADIUS_MULTIPLIERS[key];
            const px = borderRadius[key] ?? Math.round(multiplier * radiusBase);

            return (
              <div key={key} className={styles.tableRow}>
                <span className={styles.tokenName}>{key}</span>
                <span className={styles.multiplier}>×{multiplier}</span>
                <span className={styles.value}>{px}px</span>
                <div
                  className={styles.shape}
                  style={{ borderRadius: `${px}px` }}
                />
              </div>
            );
          })}

          {/* radius-full — always fixed */}
          <div className={styles.tableRow}>
            <span className={styles.tokenName}>radius-full</span>
            <span className={styles.multiplier}>—</span>
            <span className={styles.value}>full</span>
            <div className={styles.shape} style={{ borderRadius: "9999px" }} />
          </div>
        </div>
      </section>
    </div>
  );
}
