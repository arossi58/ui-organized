import { clsx } from "clsx";
import { spinnerStyles } from "@ui-organized/core";
import type { SpinnerProps } from "./Spinner.types.js";
import "@ui-organized/core/components/Spinner/Spinner.css";

/**
 * An indeterminate loading indicator: a turning ring in the current text
 * colour. For work whose progress can be measured, use Progress; for content
 * whose shape is known before it arrives, use Skeleton.
 */
export function Spinner({ size = "md", label = "Loading", decorative = false, className, ...props }: SpinnerProps) {
  return (
    <span
      className={clsx(spinnerStyles({ size }), className)}
      {...(decorative ? { "aria-hidden": true } : { role: "status", "aria-label": label })}
      {...props}
    />
  );
}
