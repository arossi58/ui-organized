/**
 * The status glyph for a test gate — one component, so the per-component panel
 * and the Quality dashboard cannot drift into rendering the same data two ways.
 *
 * Icons mirror `VARIANT_ICONS` in the design system's own Alert: success is a
 * check, warning a caution triangle, error a filled circle. Reusing the same
 * three icons for the same three meanings is the point — a reader who has seen
 * an Alert anywhere else on the site already knows what these say.
 *
 * Note `caution`, not `warning`, for the amber: the palette splits them, and
 * `--color-status-warning` is cerise. Alert's own warning variant renders with
 * the caution tokens, so this matches it.
 */
import { CircleDashed } from "lucide-react";
import { Icon, internalGlyph, type IconComponent } from "@ui-organized/react";
import type { GateStatus } from "../testStatus";
import styles from "./testStatus.module.css";

// Alert's own glyphs, so they follow the icon library the site is showing.
const STATUS_ICON: Record<GateStatus, IconComponent | typeof CircleDashed> = {
  pass: internalGlyph("check-circle"),
  warn: internalGlyph("alert-triangle"),
  fail: internalGlyph("alert-circle"),
  // "Not covered" is an absence rather than a status, and Alert has no glyph
  // for it. `Icon` takes a library component directly for this case.
  none: CircleDashed,
  skip: CircleDashed,
  "not-run": CircleDashed,
};

export function StatusIcon({ status, size = 16 }: { status: GateStatus; size?: number }) {
  return (
    <span className={styles.mark} data-status={status} aria-hidden="true">
      <Icon name={STATUS_ICON[status]} size={size} />
    </span>
  );
}
