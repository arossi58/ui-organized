import { clsx } from "clsx";
import { dividerStyles } from "./Divider.styles.js";
import type { DividerProps } from "./Divider.types.js";
import "./Divider.css";

// A thin visual rule for separating content or controls. Renders in
// `surface/overlay-tertiary` to match the design-system Divider used inside
// toolbars and dense layouts. Supports horizontal and vertical orientations;
// a vertical rule stretches to its flex row via `align-self: stretch`.
export function Divider({
  orientation = "horizontal",
  spacing = "none",
  className,
  ...props
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={clsx(dividerStyles({ orientation, spacing }), className)}
      {...props}
    />
  );
}
