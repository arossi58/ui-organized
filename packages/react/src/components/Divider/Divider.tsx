import { clsx } from "clsx";
import { dividerStyles } from "@ui-organized/core";
import type { DividerProps } from "./Divider.types.js";
import "@ui-organized/core/components/Divider/Divider.css";

// A thin visual rule for separating content or controls. Renders in
// `surface/overlay-tertiary` to match the design-system Divider used inside
// toolbars and dense layouts. Supports horizontal and vertical orientations;
// a vertical rule stretches to its flex row via `align-self: stretch`.
export function Divider({
  orientation = "horizontal",
  spacing = "none",
  labelPosition = "center",
  className,
  children,
  ...props
}: DividerProps) {
  // With a label it is not a separator: a separator's children are
  // presentational, so "or" would never be read. It is horizontal, and the
  // rules are drawn either side of the label by CSS.
  if (children != null && children !== false) {
    return (
      <div
        className={clsx(
          dividerStyles({ orientation: "horizontal", spacing, labelled: true, labelPosition }),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={clsx(dividerStyles({ orientation, spacing }), className)}
      {...props}
    />
  );
}
