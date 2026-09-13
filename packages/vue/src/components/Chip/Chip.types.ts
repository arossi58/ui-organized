import type { CanonicalIconName } from "@ui-organized/utils";
import type { ComparisonIconName } from "@ui-organized/core";
import type { IconComponent } from "../../icons/registry.js";

/**
 * `variant` and `size` are spelled out rather than inherited from core's
 * `ChipVariants`: `defineProps<ChipProps>()` is resolved by the SFC compiler at
 * build time, and it cannot follow an `extends` into another package.
 */
export interface ChipProps {
  /** Visual weight. Defaults to 'outline'. */
  variant?: "outline" | "subtle";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** The emphasized half — what the chip is *about*. Never truncated. */
  label?: string;
  /** The quiet middle: "is any of", "before", "greater than". Ignored when
   *  `operator` is set — the relation is either drawn or spelled, never both. */
  detail?: string;
  /** The relation between label and value, **drawn**: one of the design
   *  system's six comparison glyphs. Takes the place of `detail`. */
  operator?: ComparisonIconName;
  /** The glyph's accessible name — "contains". Without one the glyph is
   *  decorative and the chip loses the relation for anyone who cannot see it. */
  operatorLabel?: string;
  icon?: CanonicalIconName | IconComponent;
  /** Draws a trailing chevron, for a chip that opens a menu or popover. */
  dropdown?: boolean;
  /** Its popover is open, or it is toggled on. */
  selected?: boolean;
  /** The chip exists but does not yet stand for anything. */
  incomplete?: boolean;
  disabled?: boolean;
  /**
   * Emits `remove` and renders a dismiss button as a **sibling** of the body.
   * `removeLabel` is that button's whole accessible name — it is icon-only.
   */
  removable?: boolean;
  removeLabel?: string;
}
