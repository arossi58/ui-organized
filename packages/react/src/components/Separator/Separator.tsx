import { clsx } from "clsx";
import { separatorStyles } from "./Separator.styles.js";
import type { SeparatorProps } from "./Separator.types.js";
import "./Separator.css";

// Ark UI has no Separator primitive; Base UI's was a thin role="separator" <div>.
// The orientation/spacing variants are pure CVA classes, so the facade owns the
// (trivial) accessible markup directly — no headless primitive needed.
export function Separator({
  orientation = "horizontal",
  spacing,
  className,
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={clsx(separatorStyles({ orientation, spacing }), className)}
      {...props}
    />
  );
}
