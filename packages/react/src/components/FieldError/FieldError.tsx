import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import type { FieldErrorProps } from "./FieldError.types.js";
import "./FieldError.css";

/**
 * Reusable inline error message for form controls (Input, Select, …).
 *
 * Renders a filled alert icon followed by the message on a subdued error-tinted
 * pill (Figma 580:7201). Use it standalone, or as the `render` target of a
 * Base UI `Field.Error` so the message stays wired to the control through
 * `aria-describedby`.
 */
export function FieldError({ children, className, ...props }: FieldErrorProps) {
  if (children == null || children === "") return null;

  return (
    <span className={clsx("field-error", "text-emphasis-caption", className)} {...props}>
      <Icon name="alert-circle" size={12} className="field-error__icon" />
      {children}
    </span>
  );
}
