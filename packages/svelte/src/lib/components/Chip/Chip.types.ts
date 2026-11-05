import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ChipSegmentPart } from "@ui-organized/core";

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Shorthand for a static label segment — what the chip is *about*. Never truncated.
   *  The shorthand segments never open anything; compose `ChipSegment`s for that. */
  label?: string;
  /** Shorthand for a static operator segment: "is any of", "is before". Always spelled. */
  operator?: string;
  /** Shorthand for a static value segment. The only part that truncates. */
  value?: string;
  /** `ChipSegment`s, rendered after any shorthand segments. */
  children?: Snippet;
  /** One of its menus is open, or it is toggled on. Fills the chip with brand. */
  selected?: boolean;
  /** The chip exists but does not yet stand for anything. */
  incomplete?: boolean;
  /** Disables every segment and the dismiss control. */
  disabled?: boolean;
  /** Renders a dismiss button as the last segment — a **sibling**, never nested. */
  onremove?: (event: MouseEvent) => void;
  /**
   * The dismiss button's accessible name. It is icon-only, so this carries the
   * whole meaning. Required whenever `onremove` is set.
   */
  removeLabel?: string;
  /** Class for the chip's wrapper. */
  class?: string;
}

export interface ChipSegmentProps extends HTMLButtonAttributes {
  /** Which part of the chip's sentence this is. Defaults to `value`. */
  part?: ChipSegmentPart;
  children?: Snippet;
}
