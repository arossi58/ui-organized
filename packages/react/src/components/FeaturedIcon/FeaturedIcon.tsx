import { clsx } from "clsx";
import { FEATURED_ICON_GLYPH_SIZE, featuredIconStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import type { FeaturedIconProps } from "./FeaturedIcon.types.js";
import "@ui-organized/core/components/FeaturedIcon/FeaturedIcon.css";

/**
 * An icon in a tinted shape, the piece empty states, modal headers, feature
 * grids and metric cards are built around. Decorative unless given a `label`.
 */
export function FeaturedIcon({
  icon,
  variant = "brand",
  appearance = "subtle",
  shape = "circle",
  size = "md",
  label,
  className,
  ...props
}: FeaturedIconProps) {
  return (
    <span
      className={clsx(featuredIconStyles({ variant, appearance, shape, size }), className)}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...props}
    >
      <Icon name={icon} size={FEATURED_ICON_GLYPH_SIZE[size]} />
    </span>
  );
}
