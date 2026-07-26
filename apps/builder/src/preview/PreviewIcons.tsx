import { Icon } from "@ui-organized/react";
import { CANONICAL_ICON_NAMES, type CanonicalIconName } from "@ui-organized/utils";
import styles from "./PreviewIcons.module.css";

/**
 * Every icon the design system defines.
 *
 * Read from `CANONICAL_ICON_NAMES` rather than hand-listed: the previous list
 * had drifted to include nine names the system never shipped (`link`, `image`,
 * `file`, `folder`, `database`, `bell`, `message`, `globe`, `x`), which broke
 * `tsc` and so the whole builder build. Deriving it means the preview shows
 * exactly what exists and cannot drift again.
 */
const ALL_PREVIEW_ICONS: readonly CanonicalIconName[] = CANONICAL_ICON_NAMES;

const SIZE_STEPS = [12, 16, 20, 24, 32, 40, 48, 64];

export function PreviewIcons() {
  return (
    <div className={styles.root}>
      {/* ── Icon grid ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icon set</h2>
        <div className={styles.iconGrid}>
          {ALL_PREVIEW_ICONS.map((name) => (
            <div key={name} className={styles.iconCell} title={name}>
              <Icon name={name} size={20} />
              <span className={styles.iconLabel}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Size scale ────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Size scale</h2>
        <p className={styles.hint}>
          Stroke weight adjusts automatically when Dynamic Stroke Weight is enabled.
        </p>
        <div className={styles.sizeTable}>
          {SIZE_STEPS.map((sz) => (
            <div key={sz} className={styles.sizeRow}>
              <span className={styles.sizeLabel}>{sz}px</span>
              <div className={styles.sizeIcons}>
                {(["search", "settings", "user", "edit", "star", "home"] as CanonicalIconName[]).map((name) => (
                  <Icon key={name} name={name} size={sz} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
