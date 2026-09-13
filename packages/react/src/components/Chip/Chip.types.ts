import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { ChipVariants, ComparisonIconName } from "@ui-organized/core";
import type { IconComponent } from "../Icon/Icon.types.js";

export interface ChipProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children">, ChipVariants {
  /**
   * The emphasized half — what the chip is *about*. Rendered first, and never
   * truncated: losing the end of "Role" leaves the chip meaningless.
   */
  label?: React.ReactNode;
  /**
   * The quiet middle. Grammar between the label and the value — "is any of",
   * "before", "greater than". Omit it for a chip that is just a token.
   *
   * Ignored when `operator` is set: the relation is either drawn or spelled,
   * never both.
   */
  detail?: React.ReactNode;
  /**
   * The relation between label and value, **drawn**: one of the design
   * system's six comparison glyphs. Takes the place of `detail`.
   */
  operator?: ComparisonIconName;
  /**
   * The glyph's accessible name — "contains". Without one the glyph is
   * decorative and the chip reads as "Name Value", which loses the relation
   * entirely for anyone who cannot see it.
   */
  operatorLabel?: string;
  /** The value half. The only part that truncates. */
  children?: React.ReactNode;
  /** Leading icon — a canonical name, or a library icon component. */
  icon?: CanonicalIconName | IconComponent;
  /** Draws a trailing chevron, for a chip that opens a menu or popover. */
  dropdown?: boolean;
  /** Its popover is open, or it is toggled on. */
  selected?: boolean;
  /**
   * The chip exists but does not yet stand for anything — a filter with no
   * value chosen. Draws a dashed outline and dims the value.
   */
  incomplete?: boolean;
  disabled?: boolean;
  /**
   * Renders a dismiss button as a **sibling** of the chip's body. Never nested:
   * a button inside a button is invalid HTML and an axe `nested-interactive`
   * violation.
   */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * The dismiss button's accessible name. It is icon-only, so this carries the
   * whole meaning — "Remove" alone is useless in a row of six identical
   * buttons. Required whenever `onRemove` is set.
   */
  removeLabel?: string;
  /** Class for the chip's wrapper. Every other prop lands on the body. */
  className?: string;
}
