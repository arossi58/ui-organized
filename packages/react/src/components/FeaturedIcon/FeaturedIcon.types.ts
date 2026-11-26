import type * as React from "react";
import type { IconComponent, IconName } from "../Icon/Icon.types.js";

export interface FeaturedIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The icon: its native name in the active library (registered with
   * `registerIcons`), or a library icon component supplied directly.
   */
  icon: IconName | IconComponent;
  /** Colour. `brand` follows the theme; the rest are the status colours. Defaults to 'brand'. */
  variant?: "brand" | "neutral" | "success" | "info" | "caution" | "error";
  /**
   * `subtle` is a tint with the colour's content tone, `solid` the full colour,
   * `outline` no fill and two faded rings. Defaults to 'subtle'.
   */
  appearance?: "subtle" | "solid" | "outline";
  /** Defaults to 'circle'. */
  shape?: "circle" | "square";
  /** 32, 40, 48 or 56 px, holding a 16, 20, 24 or 28 px icon. Defaults to 'md'. */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * An accessible name, for an icon that means something on its own. Without
   * one it is decorative and hidden from assistive technology, which is right
   * whenever a heading or label beside it already says the same thing.
   */
  label?: string;
}
