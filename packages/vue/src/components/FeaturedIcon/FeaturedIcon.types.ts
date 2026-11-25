import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface FeaturedIconProps {
  /** The icon: its native name in the active library, or a component. */
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
  /** An accessible name, for an icon that means something on its own. Without one it is decorative. */
  label?: string;
}
