import type { Snippet } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { ChipVariants, ComparisonIconName } from "@ui-organized/core";

export interface ChipProps extends Omit<HTMLButtonAttributes, "children">, ChipVariants {
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
  /** The value half. The only part that truncates. */
  children?: Snippet;
  icon?: CanonicalIconName;
  /** Draws a trailing chevron, for a chip that opens a menu or popover. */
  dropdown?: boolean;
  /** Its popover is open, or it is toggled on. */
  selected?: boolean;
  /** The chip exists but does not yet stand for anything. */
  incomplete?: boolean;
  disabled?: boolean;
  /** Renders a dismiss button as a **sibling** of the body, never nested. */
  onremove?: (event: MouseEvent) => void;
  /**
   * The dismiss button's accessible name. It is icon-only, so this carries the
   * whole meaning. Required whenever `onremove` is set.
   */
  removeLabel?: string;
  /** Class for the chip's wrapper. Every other prop lands on the body. */
  class?: string;
}
