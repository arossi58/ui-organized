import { Button, Card, CardBody, Input, Badge } from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import styles from "./PreviewSizing.module.css";

export function PreviewSizing() {
  const { borderRadius, spacingScale } = useBuilderStore();

  const radiusEntries = Object.entries(borderRadius);
  const spacingEntries = Object.entries(spacingScale);

  return (
    <div className={styles.root}>
      {/* ── Radius scale ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Radius scale</h2>
        <div className={styles.radiusGrid}>
          {radiusEntries.map(([key, px]) => {
            const isFull = px >= 9999;
            return (
              <div key={key} className={styles.radiusCell}>
                <div
                  className={styles.radiusSwatch}
                  style={{ borderRadius: isFull ? "9999px" : `${px}px` }}
                />
                <span className={styles.tokenName}>{key}</span>
                <span className={styles.tokenValue}>{isFull ? "full" : `${px}px`}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Radius in context ─────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Radius in context</h2>
        <p className={styles.hint}>
          Interactive components pull their corner radius from the scale — adjust
          the base unit to see them reshape together.
        </p>
        <div className={styles.contextRow}>
          <Button intent="primary">Primary</Button>
          <Button intent="secondary">Secondary</Button>
          <Input placeholder="Input field" />
          <Badge variant="info">Badge</Badge>
        </div>
        <div className={styles.contextRow}>
          <Card variant="outlined" padding="md" className={styles.contextCard}>
            <CardBody>Cards round to a larger step in the scale.</CardBody>
          </Card>
        </div>
      </section>

      {/* ── Spacing scale ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spacing scale</h2>
        <div className={styles.spacingList}>
          {spacingEntries.map(([key, px]) => (
            <div key={key} className={styles.spacingRow}>
              <span className={styles.tokenName}>{key}</span>
              <span className={styles.spacingValue}>{px}px</span>
              <div className={styles.spacingTrack}>
                <div className={styles.spacingBar} style={{ width: `${Math.min(px, 256)}px` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
