import type { ChipSegmentPart } from "@ui-organized/core";

export interface ChipProps {
  /**
   * Shorthand for a static label segment — what the chip is *about*. Never
   * truncated. The shorthand segments never open anything; for a chip whose
   * parts each open a menu, compose `ChipSegment`s in the default slot.
   */
  label?: string;
  /** Shorthand for a static operator segment: "is any of", "is before". Always spelled. */
  operator?: string;
  /** Shorthand for a static value segment. The only part that truncates. */
  value?: string;
  /** One of its menus is open, or it is toggled on. Fills the chip with brand. */
  selected?: boolean;
  /** The chip exists but does not yet stand for anything. Dashed outline. */
  incomplete?: boolean;
  /** Disables every segment and the dismiss control. */
  disabled?: boolean;
  /**
   * Emits `remove` and renders a dismiss button as the chip's last segment — a
   * **sibling** of the others, never nested. `removeLabel` is that button's
   * whole accessible name: it is icon-only.
   */
  removable?: boolean;
  removeLabel?: string;
}

export interface ChipSegmentProps {
  /** Which part of the chip's sentence this is. Defaults to `value`. */
  part?: ChipSegmentPart;
}
