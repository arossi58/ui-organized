import type { ComponentType } from "react";
import {
  Icon,
  getIconSet,
  internalGlyph,
  toNativeName,
  useIconConfig,
  type IconLibrary,
} from "@ui-organized/react";
import styles from "./PreviewIcons.module.css";

/**
 * The glyphs the components draw, in whichever library is active.
 *
 * There is no shared list of icon names to show: names are each library's own,
 * and an app registers the icons it uses. What every library does have is the
 * adapter's set of the components' own glyphs, so that is the grid. Each is
 * labelled with the name the active library gives it, read off the component,
 * which is the name an app would use for it in `<Icon name>`.
 */
function useGlyphs(): { label: string; component: ComponentType<any>; icon: ComponentType<any> }[] {
  const { library, icons } = useIconConfig();
  const set = icons ?? getIconSet(library);
  if (!set) return [];
  // Drawn through the glyph rather than the component itself, so the adapter's
  // own size and stroke props apply (Tabler's `stroke`, Heroicons' `width`).
  return Object.entries(set.outline).map(([glyph, component]) => ({
    component: component as ComponentType<any>,
    icon: internalGlyph(glyph as Parameters<typeof internalGlyph>[0]),
    label: nativeLabel(set.library, component as ComponentType<any>),
  }));
}

/** Lucide and Tabler set `displayName`; Heroicons are `forwardRef`s of a named function. */
function nativeLabel(library: IconLibrary, component: ComponentType<any>): string {
  const c = component as ComponentType<any> & { render?: { name?: string } };
  const exportName = c.displayName ?? c.render?.name ?? c.name ?? "";
  return exportName ? toNativeName(library, exportName) : "";
}

const SIZE_STEPS = [12, 16, 20, 24, 32, 40, 48, 64];

export function PreviewIcons() {
  const glyphs = useGlyphs();
  // Unique by component: two glyphs can share one icon (Heroicons draws undo
  // and rotate-ccw with the same arrow).
  const unique = glyphs.filter((g, i) => glyphs.findIndex((o) => o.component === g.component) === i);
  const scale = unique.slice(0, 6);
  return (
    <div className={styles.root}>
      {/* ── Icon grid ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icon set</h2>
        <div className={styles.iconGrid}>
          {unique.map(({ label, icon }) => (
            <div key={label} className={styles.iconCell} title={label}>
              <Icon name={icon} size={20} />
              <span className={styles.iconLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Size scale ────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Size scale</h2>
        <p className={styles.hint}>
          Stroke weight adjusts automatically when dynamic stroke weight is enabled.
        </p>
        <div className={styles.sizeTable}>
          {SIZE_STEPS.map((sz) => (
            <div key={sz} className={styles.sizeRow}>
              <span className={styles.sizeLabel}>{sz}px</span>
              <div className={styles.sizeIcons}>
                {scale.map(({ label, icon }) => (
                  <Icon key={label} name={icon} size={sz} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
