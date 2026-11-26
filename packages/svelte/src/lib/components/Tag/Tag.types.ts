import type { IconName } from "../Icon/Icon.types.js";
import type { ClassValue, HTMLAttributes } from "svelte/elements";
import type { Snippet } from "svelte";
import type { IconComponent } from "../../icons/registry.js";
import type { ControlSize } from "@ui-organized/core";

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "class"> {
  /** Colour: a status, or `brand` (follows the theme) or `neutral`. Defaults to 'success'. */
  variant?: "success" | "info" | "info-secondary" | "caution" | "error" | "brand" | "neutral";
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /**
   * `solid` (the default) is the full colour with a label that reads on it,
   * `subtle` a tint with the colour's content tone, `outline` the tint with a ring.
   */
  appearance?: "solid" | "subtle" | "outline";
  /**
   * @deprecated Use `appearance`. `true` is `appearance="solid"` and `false` is
   * `appearance="subtle"`; `appearance` wins when both are given.
   */
  emphasized?: boolean;
  /** `square` (the default, a 4px radius) or `pill`. */
  shape?: "square" | "pill";
  /** A leading dot in the label's colour, for a status read at a glance. */
  dot?: boolean;
  /**
   * Renders a remove button after the label and calls this when it is pressed.
   * Give it a `removeLabel`: the button has no text of its own.
   */
  onremove?: (event: MouseEvent) => void;
  /** The remove button's accessible name, naming what it removes: "Remove Design". */
  removeLabel?: string;
  /**
   * Optional icon rendered inside the tag — its native name in the active
   * library or an icon component. Rendered at 16px across every tag size, `spacing-01` from the
   * label.
   */
  icon?: IconName | IconComponent;
  /** Which side of the label the icon sits on. Defaults to 'left'. */
  iconPosition?: "left" | "right";
  /**
   * Merged after the recipe's classes. A `ClassValue`, like any element's
   * `class`, not a string: this renders a plain element, so it can receive an
   * Ark `asChild`'s props, which arrive in Svelte's own shapes. See
   * ../../types.ts.
   */
  class?: ClassValue | null;
  children?: Snippet;
}
