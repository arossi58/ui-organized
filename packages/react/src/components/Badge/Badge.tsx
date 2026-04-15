import { clsx } from "clsx";
import { badgeStyles } from "./Badge.styles.js";
import type { BadgeProps } from "./Badge.types.js";
import "./Badge.css";

export function Badge({
  variant,
  size,
  emphasized = true,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        badgeStyles({ variant, size }),
        !emphasized && "badge--subdued",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
