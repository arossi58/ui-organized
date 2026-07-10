import { clsx } from "clsx";
import { Icon } from "../Icon/Icon.js";
import { tagStyles } from "./Tag.styles.js";
import type { TagProps } from "./Tag.types.js";
import "./Tag.css";

/** Icons render at 16px across every tag size. */
const ICON_SIZE = 16;

export function Tag({
  variant,
  size,
  emphasized = true,
  icon,
  iconPosition = "left",
  className,
  children,
  ...props
}: TagProps) {
  const iconEl = icon ? (
    <Icon name={icon} size={ICON_SIZE} className="tag__icon" />
  ) : null;

  return (
    <span
      className={clsx(
        tagStyles({ variant, size }),
        !emphasized && "tag--subdued",
        className
      )}
      {...props}
    >
      {iconPosition === "left" && iconEl}
      <span className="tag__label">{children}</span>
      {iconPosition === "right" && iconEl}
    </span>
  );
}
