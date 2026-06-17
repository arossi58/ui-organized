import { Icon } from "@ui-organized/react";
import type { CanonicalIconName } from "@ui-organized/utils";
import styles from "./PreviewIcons.module.css";

const ALL_PREVIEW_ICONS: CanonicalIconName[] = [
  "search", "settings", "user", "mail", "check", "close", "plus", "minus",
  "chevron-right", "chevron-left", "chevron-up", "chevron-down",
  "arrow-right", "arrow-left", "arrow-up", "arrow-down",
  "edit", "trash", "download", "upload",
  "check-circle", "alert-circle", "info", "alert-triangle",
  "star", "heart", "lock", "unlock",
  "home", "calendar", "filter", "eye", "eye-off", "bookmark",
  "refresh", "copy", "tag", "external-link",
  "grid", "list", "menu", "users",
  "loader", "phone", "sort-asc", "clock",
];

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
