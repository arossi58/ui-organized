import { clsx } from "clsx";
import { badgeStyles } from "./Badge.styles.js";
import type { BadgeProps } from "./Badge.types.js";
import "./Badge.css";

export function Badge({ variant, size, className, children, ...props }: BadgeProps) {
  return (
    <span className={clsx(badgeStyles({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}
