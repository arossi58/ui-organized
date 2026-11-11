import type * as React from "react";
import type { ChipSegmentPart } from "@ui-organized/core";

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * Shorthand for a static label segment — what the chip is *about*. Rendered
   * first, and never truncated: losing the end of "Role" leaves the chip
   * meaningless.
   *
   * The shorthand segments never open anything. For a chip whose parts each
   * open a menu, compose `ChipSegment`s as children instead.
   */
  label?: React.ReactNode;
  /**
   * Shorthand for a static operator segment — the grammar between label and
   * value: "is any of", "is before", "is greater than". Always spelled.
   */
  operator?: React.ReactNode;
  /** Shorthand for a static value segment. The only part that truncates. */
  value?: React.ReactNode;
  /**
   * `ChipSegment`s, rendered after any shorthand segments. Each one is its own
   * control, so each can be projected into its own menu or popover trigger.
   */
  children?: React.ReactNode;
  /** One of its menus is open, or it is toggled on. Fills the chip with brand. */
  selected?: boolean;
  /**
   * The chip exists but does not yet stand for anything — a filter with no
   * value chosen. Draws a dashed outline and dims the value.
   */
  incomplete?: boolean;
  /** Disables every segment and the dismiss control. */
  disabled?: boolean;
  /**
   * Renders a dismiss button as the chip's last segment — a **sibling** of the
   * others, never nested: a button inside a button is invalid HTML and an axe
   * `nested-interactive` violation.
   */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * The dismiss button's accessible name. It is icon-only, so this carries the
   * whole meaning — "Remove" alone is useless in a row of six identical
   * buttons. Required whenever `onRemove` is set.
   */
  removeLabel?: string;
}

export interface ChipSegmentProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Which part of the chip's sentence this is. Decides its padding and ink. Defaults to `value`. */
  part?: ChipSegmentPart;
}
