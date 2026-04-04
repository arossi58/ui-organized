import { useBuilderStore } from "../state/themeState";
import styles from "./BorderRadiusPanel.module.css";

const RADIUS_KEYS = [
  "radius-01", "radius-02", "radius-03", "radius-04",
  "radius-05", "radius-06", "radius-07", "radius-08",
  "radius-09", "radius-10", "radius-11", "radius-12",
];

function RadiusRow({ name, value, onChange }: {
  name: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.radiusRow}>
      <span className={styles.radiusName}>{name}</span>
      <input
        type="number"
        className={styles.radiusInput}
        value={value}
        min={0}
        max={999}
        step={1}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      />
      <span className={styles.unit}>px</span>
      <div
        className={styles.preview}
        style={{ borderRadius: `${value}px` }}
      />
    </div>
  );
}

export function BorderRadiusPanel() {
  const { borderRadius, setRadius } = useBuilderStore();

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Border Radius</h3>
        <p className={styles.hint}>
          Adjust each radius step independently. The live preview updates as you type.
        </p>

        <div className={styles.rows}>
          {RADIUS_KEYS.map((key) => (
            <RadiusRow
              key={key}
              name={key}
              value={borderRadius[key] ?? 0}
              onChange={(v) => setRadius(key, v)}
            />
          ))}

          {/* radius-full is fixed */}
          <div className={styles.radiusRow}>
            <span className={styles.radiusName}>radius-full</span>
            <span className={styles.fixedValue}>99999px</span>
            <span className={styles.fixedLabel}>(fixed — pill shape)</span>
            <div className={styles.preview} style={{ borderRadius: "9999px" }} />
          </div>
        </div>
      </section>

      {/* Mini component preview */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Preview</h3>
        <div className={styles.componentPreview}>
          <div
            className={styles.previewCard}
            style={{ borderRadius: `${borderRadius["radius-04"] ?? 8}px` }}
          >
            Card (radius-04)
          </div>
          <div
            className={styles.previewButton}
            style={{ borderRadius: `${borderRadius["radius-04"] ?? 8}px` }}
          >
            Button
          </div>
          <div
            className={styles.previewPill}
            style={{ borderRadius: "9999px" }}
          >
            Badge
          </div>
          <div
            className={styles.previewInput}
            style={{ borderRadius: `${borderRadius["radius-02"] ?? 4}px` }}
          >
            Input (radius-02)
          </div>
        </div>
      </section>
    </div>
  );
}
